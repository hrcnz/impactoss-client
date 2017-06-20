import styled from 'styled-components';
import { palette } from 'styled-theme';

import Link from './Link';

export default styled(Link)`
  color:${(props) => props.active ? palette('headerNavPagesItem', 1) : palette('headerNavPagesItem', 0)};
  background-color:${(props) => props.active ? palette('headerNavPagesItem', 3) : palette('headerNavPagesItem', 2)};
  &:hover {
    color:${(props) => props.active ? palette('headerNavPagesItemHover', 1) : palette('headerNavPagesItemHover', 0)};
    background-color:${(props) => props.active ? palette('headerNavPagesItemHover', 3) : palette('headerNavPagesItemHover', 2)};
  }
`;
