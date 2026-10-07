const form=document.querySelector('#onboarding'), steps=[...form.querySelectorAll('[data-step]')], next=document.querySelector('#next'), back=document.querySelector('#back'), submit=document.querySelector('#submit'), error=document.querySelector('#form-error');
let step=0;
function showStep(){steps.forEach((s,i)=>s.hidden=i!==step);next.hidden=step===2;submit.hidden=step!==2;back.hidden=step===0;document.querySelector('#progress').textContent=`Step ${step+1} of 3 · About 3 minutes`;document.querySelectorAll('.steps span').forEach((s,i)=>s.classList.toggle('active',i<=step));}
function checkStep(){const email=form.elements.email, confirmation=form.elements['confirm-email'];confirmation.setCustomValidity(email.value.trim().toLowerCase()===confirmation.value.trim().toLowerCase()?'':'Please enter the same email address.');for(const control of steps[step].querySelectorAll('input,select,textarea')){if(!control.checkValidity()){control.reportValidity();return false}}return true;}
form.noValidate=true;showStep();
try{form.elements.email.value=sessionStorage.getItem('peekaplate-email')||''}catch{}
document.querySelector('#submission-id').value=crypto.randomUUID();
next.addEventListener('click',()=>{if(checkStep()){step++;showStep();steps[step].querySelector('input,select,textarea')?.focus()}});
back.addEventListener('click',()=>{step--;showStep();steps[step].querySelector('input,select,textarea')?.focus()});
form.addEventListener('submit',async e=>{e.preventDefault();if(submit.disabled)return;if(step<2){next.click();return}if(!checkStep())return;for(let i=0;i<steps.length;i++){const invalid=[...steps[i].querySelectorAll('input,select,textarea')].find(c=>!c.checkValidity());if(invalid){step=i;showStep();invalid.reportValidity();return}}
submit.disabled=true;back.disabled=true;submit.textContent='Sending…';error.hidden=true;
const data=new FormData(form);data.delete('confirm-email');
try{const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()});if(!response.ok)throw new Error('Submission failed');try{sessionStorage.removeItem('peekaplate-email')}catch{}document.querySelector('#thanks').showModal();form.reset();}catch{error.textContent='We couldn’t submit your answers. Please try again, or email hello@peekaplate.io. Your answers are still here.';error.hidden=false;submit.disabled=false;back.disabled=false;submit.textContent='Join PeekaPlate →';}
});
