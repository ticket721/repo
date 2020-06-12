import React                    from 'react';
import { useSubspace } from '@embarklabs/subspace-react';
import { getContract }          from '@frontend/core/lib/subspace/getContract';
import { useSelector } from 'react-redux';
import { AppState }    from '@frontend/core/lib/redux';
// tslint:disable-next-line:no-var-requires
const {observe} = require('@embarklabs/subspace-react');

const Balance = ({balance}: any) => {
    return <p>{balance}</p>
};

const ObservedBalance = observe(Balance);

export default () => {

    const subspace = useSubspace();

    const T721Token = getContract(subspace, 't721token', 'T721Token');
    const auth = useSelector(((state: AppState) => state.auth));

    const trackedBalance$ = T721Token.methods.balanceOf(auth.user.address).track();

    console.log(auth);
    console.log(T721Token);

    return <div className='Profile'>
        <p style={{ color: 'white' }}>
            Profile
        </p>
        <ObservedBalance balance={trackedBalance$}/>
    </div>
}
