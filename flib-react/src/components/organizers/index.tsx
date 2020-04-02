import * as React from 'react';
import styled from '../../../config/styled';

export interface InviteOrganizersProps extends React.ComponentProps<any> {
  currentUser: SingleOrganizer;
  organizers: SingleOrganizer[];
  sendInvite: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputLabel: string;
  label:string;
  placeholder: string;
}

interface OrganizerProp {
  key: string | number;
  organizer: SingleOrganizer;
}

interface SingleOrganizer {
  acceptedOn?: string | Date | null;
  id: string | number;
  name?: string;
  image?: string;
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
`;

const ImgContainer = styled.div`
  border-radius: 100%;
  height: 40px;
  overflow: hidden;
  margin-right: ${props => props.theme.regularSpacing};
  width: 40px;

  img {
    height: 100%;
    object-fit: cover;
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

const Organizer = (props: OrganizerProp) => {
  return <ListItem key={props.organizer.id}>
      <ImgContainer>
        <img src={props.organizer.image} alt={props.organizer.name}/>
      </ImgContainer>
      <div>
        <span>{props.organizer.name}</span>
        {props.organizer.status &&
          <span>{props.organizer.status} {props.organizer.acceptedOn && `on ${props.organizer.acceptedOn}`}</span>
        }
      </div>
    </ListItem>
};

const InviteOrganizers: React.FunctionComponent<InviteOrganizersProps> = (props: InviteOrganizersProps): JSX.Element => {
  return <div>
    <StyledContainer>
      <label>{props.label}</label>
      <OrganizersList>
        <Organizer key={props.currentUser.id} organizer={props.currentUser} />
        {props.organizers.map((organizer) => {
          return <Organizer key={organizer.id} organizer={organizer}/>
        })}
      </OrganizersList>
    </StyledContainer>
    <StyledInputContainer>
      <StyledLabel>{props.inputLabel}</StyledLabel>
      <StyledInput type="text" placeholder={props.placeholder} value={props.value} onChange={props.handleChange} />
      <button type="button" onClick={props.sendInvite}>Send</button>
    </StyledInputContainer>
  </div>
}

export default InviteOrganizers;
