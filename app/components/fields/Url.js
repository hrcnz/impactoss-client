import styled from 'styled-components';
import { palette } from 'styled-theme';

import A from 'components/styled/A';

const Url = styled(A)`
  color: ${palette('link', 2)};
  font-weight: bold;
  font-size: 0.85em;
`;

export default Url;
