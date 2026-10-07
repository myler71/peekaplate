import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
export function confirmationMessage(data){
  const name=String(data.name||'').trim().split(/\s+/)[0].slice(0,80)||'there';
  const email=String(data.email||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||/[\r\n]/.test(email))throw new Error('Invalid recipient');
  const id=createHash('sha256').update(String(data['submission-id']||JSON.stringify(data))).digest('hex');
  return {from:'PeekaPlate <hello@peekaplate.io>',to:email,replyTo:'hello@peekaplate.io',subject:'Thanks for joining PeekaPlate',messageId:`<${id}@peekaplate.io>`,text:`Hi ${name},\n\nThanks for joining PeekaPlate and telling us about your restaurant. We’ve received your answers.\n\nWe’ll be in touch shortly with next steps and follow-up questions tailored to your menu, your guests and the analysis that would be most useful to you.\n\nYou can reply directly to this email if you’d like to add anything.\n\nVivien & the PeekaPlate team\nhttps://peekaplate.io\n\nYou’re receiving this confirmation because you submitted the PeekaPlate restaurant onboarding form.`};
}
export default {
  async formSubmitted(event){
    const data=event.data;
    if(data['application-kind']!=='restaurant-pilot-v1'||data['contact-consent']!=='yes')return;
    if(!process.env.PORKBUN_SMTP_PASSWORD)throw new Error('Email setup incomplete: configure PORKBUN_SMTP_PASSWORD in Netlify Functions environment. Submission remains saved in Netlify Forms.');
    const transporter=nodemailer.createTransport({host:'smtp.porkbun.com',port:465,secure:true,auth:{user:'hello@peekaplate.io',pass:process.env.PORKBUN_SMTP_PASSWORD},connectionTimeout:15000,socketTimeout:20000});
    await transporter.sendMail(confirmationMessage(data));
    console.info('Onboarding confirmation accepted by mail server.');
  }
};
