import { Link } from 'react-router-dom';
export function NotFoundPage() { return <div className="page-wrap missing"><span className="big-diamond"/><p className="eyebrow">OFF THE MAP</p><h1>Nothing here.</h1><Link className="primary-action" to="/">Return to explore →</Link></div>; }
