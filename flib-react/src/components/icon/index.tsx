import React from 'react';
import styled from '../../../config/styled';
import { icons } from '../../shared/icons';

export interface IconProps extends React.ComponentProps<any> {
  icon: string;
}

const Svg = styled.svg`
  display: block;
  vertical-align: middle;
  shape-rendering: inherit;
`;

const Path = styled.path`
  fill: red;
`;

/**
 * An Icon is a piece of visual element, but we must ensure its accessibility while using it.
 * It can have 2 purposes:
 *
 * - *decorative only*: for example, it illustrates a label next to it. We must ensure that it is ignored by screen readers, by setting `aria-hidden` attribute (ex: `<Icon icon="check" aria-hidden />`)
 * - *non-decorative*: it means that it delivers information. For example, an icon as only child in a button. The meaning can be obvious visually, but it must have a proper text alternative via `aria-label` for screen readers. (ex: `<Icon icon="print" aria-label="Print this document" />`)
 */
export const Icon: React.FunctionComponent<IconProps> = (props: IconProps): JSX.Element => {
  return <Svg viewBox="0 0 49 20">
      <Path d={icons[props.icon]} />
    </Svg>
}

export default Icon;
