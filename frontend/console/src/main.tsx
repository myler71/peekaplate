import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const root = document.getElementById('root');
if (!root) throw new Error('Staff console root element is missing');

createRoot(root).render(
  <StrictMode>
    <main>
      <p className="eyebrow">PeekaPlate · Staff staging</p>
      <h1>A clear menu starts with trusted content.</h1>
      <p>
        The staff workspace is being prepared. Authentication, review and publication are not
        enabled yet.
      </p>
      <p className="note">This environment contains no restaurant or customer records.</p>
    </main>
  </StrictMode>,
);
