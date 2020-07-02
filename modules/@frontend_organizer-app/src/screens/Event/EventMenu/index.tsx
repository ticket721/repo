import React                        from 'react';
import { useParams }                from 'react-router';
import styled                       from 'styled-components';

import { Dropdown }                 from './Dropdown';
import { DateSubMenu }              from './DateSubMenu';
import { GlobalSubMenu }            from './GlobalSubMenu';
import { DateActions }              from './DateActions';
import { Actions }                  from './Actions';
import './Actions/locales';

export const EventMenu: React.FC = () => {
    const { dateId } = useParams();

    return (
        <Container>
            <Dropdown/>
            {
                dateId &&
                    <>
                        <DateActions/>
                        <Separator/>
                        <DateSubMenu/>
                        <Separator/>
                    </>
            }
            <GlobalSubMenu/>
            {
                dateId && (
                  <Actions />
                )
            }
        </Container>
    )
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: calc(100vh - 80px);
  position: fixed;
  left: 0;
  top: 81px;
  padding: ${props => props.theme.biggerSpacing} 0;
  background-color: ${(props) => props.theme.darkerBg};
  z-index: 3;

  button {
    outline: none;
  }
`;

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;
