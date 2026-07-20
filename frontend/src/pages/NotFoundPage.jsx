import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
    <h1 className="text-6xl font-display font-bold text-primary-600 dark:text-primary-400 mb-3">৪০৪</h1>
    <p className="text-slate-600 dark:text-slate-300 mb-6">দুঃখিত, আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।</p>
    <Link to="/">
      <Button>হোমপেজে ফিরে যান</Button>
    </Link>
  </div>
);

export default NotFoundPage;
