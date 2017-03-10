import React, { PropTypes } from 'react';

import Container from 'components/basic/Container';
import H1 from './H1';
import PrimaryAction from './PrimaryAction';
import SimpleAction from './SimpleAction';

class Page extends React.Component { // eslint-disable-line react/prefer-stateless-function
  renderAction = (action) => {
    if (action.type === 'simple') {
      return (
        <SimpleAction onClick={action.onClick}>
          {action.title}
        </SimpleAction>
      );
    }
    if (action.type === 'primary') {
      return (
        <PrimaryAction onClick={action.onClick}>
          {action.title}
        </PrimaryAction>
      );
    }
    return null;
  }
  render() {
    return (
      <Container>
        <H1>{this.props.title}</H1>
        {
          this.props.actions.map((action) => (
            this.renderAction(action)
          ))
        }
        {this.props.children}
      </Container>
    );
  }
}

Page.propTypes = {
  title: PropTypes.string.isRequired,
  actions: PropTypes.array,
  children: PropTypes.array,
};

export default Page;
