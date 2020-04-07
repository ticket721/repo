import React    from 'react';
import { Link }                  from '@libs/components/link';

const Home: React.FC = () => {
  return (
  <div className='Home' style={{ color: 'white' }}>
    Home
    <Link to={`/home/test`}>
      Test Link
    </Link>
  </div>
)};

export default Home;
