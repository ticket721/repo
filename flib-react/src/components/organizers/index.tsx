import * as React from 'react';
import Icon from '../icon';
import styled from '../../../config/styled';

export interface InviteOrganizersProps extends React.ComponentProps<any> {
  currentUser: SingleOrganizer;
  organizers: SingleOrganizer[];
  sendInvite: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemove: (user: SingleOrganizer) => void;
  inputLabel: string;
  label:string;
  placeholder: string;
  inputValue: string;
}

interface OrganizerProp {
  key: string | number;
  organizer: SingleOrganizer;
  removable?: boolean;
  removeUser: (user: SingleOrganizer) => void;
}

interface SingleOrganizer {
  acceptedOn?: string | Date | null;
  email: string;
  id: string;
  name?: string;
  image: string | undefined;
  status?: string | null;
}

const StyledLabel = styled.label`
  display: inline-flex;
  transform: translateX(-12px);
  transition: all 300ms ease;

  &::before {
    background-color: ${ props => props.theme.primaryColor};
    border-radius: 100%;
    content: "";
    display: inline-block;
    height: 4px;
    margin-right: 8px;
    opacity: 0;
    position: relative;
    top: 2px;
    transition: opacity 300ms ease;
    width: 4px;
  }
`;

const StyledContainer = styled.div`
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-direction: column;
  padding-top: ${props => props.theme.biggerSpacing};
`;

const StyledInputContainer = styled(StyledContainer)`
  margin-top: ${props => props.theme.regularSpacing};
  transition: background-color 300ms ease;

  &:hover {
    background-color: ${props => props.theme.componentColorLight};
  }

  &:focus-within {
    background-color: ${props => props.theme.componentColorLighter};

    ${StyledLabel} {
      transform: translateX(0px);

      &::before {
        opacity: 1;
      }
    }
  }
`;

const ListItem = styled.li`
  align-items: center;
  display: flex;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: ${props => props.theme.regularSpacing};

  span {
    display: block;

    &:nth-of-type(2) {
      color: ${props => props.theme.textColorDarker};
      font-size: 12px;
      margin-top: 8px;
    }
  }

  &:last-of-type {
    margin-bottom: 0;
  }

  button {
    margin-left: auto;
  }
`;

const ImgContainer = styled.div`
  border-radius: 100%;
  height: 40px;
  overflow: hidden;
  margin-right: ${props => props.theme.regularSpacing};
  width: 40px;

  img {
    height: 100%;
    object-fit: contain;
    width: 100%;
  }
`;

const OrganizersList = styled.ul`
  padding: ${props => props.theme.biggerSpacing};
`

const StyledInput = styled.input`
  background: url('assets/icons/icon--mail.svg') left 18px/16px no-repeat;
  margin-left: ${props => props.theme.biggerSpacing};
`;

const RoundedButton = styled.button`
  background-color: ${props => props.theme.componentColorLight};
  border-radius: 100%;
  height: 40px;
  margin-right: ${props => props.theme.biggerSpacing};
  width: 40px;

  svg {
    margin: auto;
    transform: rotate(180deg);
  }
`;

const Organizer = (props: OrganizerProp) => {
  return <ListItem>
      <ImgContainer>
        <img src={props.organizer.image ? props.organizer.image: 'assets/images/t721--logo.png'} alt={props.organizer.name}/>
      </ImgContainer>
      <div>
        <span>{props.organizer.name ? props.organizer.name : props.organizer.email}</span>
        {props.organizer.status &&
          <span>{props.organizer.status} {props.organizer.acceptedOn && `on ${props.organizer.acceptedOn}`}</span>
        }
      </div>
      {props.removable &&
        <button type="button" onClick={() => props.removeUser(props.organizer)}>
          <Icon icon='close' height='12' width='12' fill='rgba(255,255,255, 0.6)' />
        </button>
      }
    </ListItem>
};

const InviteOrganizers: React.FunctionComponent<InviteOrganizersProps> = (props: InviteOrganizersProps): JSX.Element => {
  return <div className="container">
    <StyledContainer>
      <label>{props.label}</label>
      <OrganizersList>
        <Organizer key={props.currentUser.id} organizer={props.currentUser} removeUser={props.handleRemove}/>
        {props.organizers.map((organizer) => {
          return <Organizer key={organizer.id ? organizer.id : organizer.email} organizer={organizer} removable removeUser={props.handleRemove}/>
        })}
      </OrganizersList>
    </StyledContainer>
    <StyledInputContainer>
      <StyledLabel>{props.inputLabel}</StyledLabel>
      <div className="row jcsb">
        <StyledInput type="text" placeholder={props.placeholder} value={props.inputValue} onChange={props.handleChange} />
        {props.inputValue  &&
          <RoundedButton type="button" onClick={props.sendInvite}>
            <Icon icon='arrow' height='14' width='14' fill='rgba(255, 255, 255, 0.9)' />
          </RoundedButton>
        }
      </div>
    </StyledInputContainer>
  </div>
}

export default InviteOrganizers;
