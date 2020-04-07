import { useEffect } from 'react';
import { withRouter } from 'react-router';

const ScrollToTop = ({ location, children }: any) => {
    useEffect(() => {
        return () => {
            window.scrollTo(0, 0);
        };
    }, [location.pathname]);

    return children;
};

export default withRouter(ScrollToTop as any);
