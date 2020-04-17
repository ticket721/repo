import * as React from 'react';
import CardContainer from '../../elements/card-container';
import Toggle from '../../inputs/toggle';
import slugify from 'slugify';
import styled from '../../../../config/styled';

export interface DescriptionLinkProps extends React.ComponentProps<any> {
  addOns: AddOn[];
  onChange: () => void;
  removeBg?: boolean;
  gradient?: string[];
  title: string;
}

interface AddOn {
  id: number | string;
  name:string;
  price: string;
  description: string;
}

const Title = styled.h4`
  color: ${props => props.theme.textColorDarker};
  margin-bottom: ${props => props.theme.regularSpacing};
  width: 100%;
`;

const Container = styled(CardContainer)`
  label  {
    font-size: 1rem;
    font-weight: 700;
  }
`
export const DescriptonLink: React.FunctionComponent<DescriptionLinkProps> = (props: DescriptionLinkProps): JSX.Element => {
  return <Container removeBg={props.removeBg}>
          <Title className="uppercase">{props.title}</Title>
          {props.addOns.map((addOn: AddOn) => {
            const toggleLabel = `${addOn.name} - ${addOn.price}`;

            return  <Toggle
                      gradient={props.gradient}
                      key={addOn.id}
                      label={toggleLabel}
                      name={slugify(addOn.name, {lower: true})}
                      onChange={props.onChange}
                      description={addOn.description}
                    />

          })}
        </Container>
};

export default DescriptonLink;
