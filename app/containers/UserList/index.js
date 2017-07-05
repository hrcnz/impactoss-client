/*
 *
 * UserList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { loadEntitiesIfNeeded } from 'containers/App/actions';
import { isReady } from 'containers/App/selectors';
import appMessages from 'containers/App/messages';

import EntityList from 'containers/EntityList';

import { FILTERS, EDITS } from './constants';
import { selectConnections, selectUsers, selectTaxonomies } from './selectors';
import messages from './messages';

export class UserList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  render() {
    const { dataReady } = this.props;

    const headerOptions = {
      supTitle: this.context.intl.formatMessage(messages.pageTitle),
      icon: 'users',
    };

    return (
      <div>
        <Helmet
          title={this.context.intl.formatMessage(messages.pageTitle)}
          meta={[
            { name: 'description', content: this.context.intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <EntityList
          location={this.props.location}
          entities={this.props.entities}
          taxonomies={this.props.taxonomies}
          connections={this.props.connections}
          path="users"
          filters={FILTERS}
          edits={EDITS}
          header={headerOptions}
          dataReady={dataReady}
          entityTitle={{
            single: this.context.intl.formatMessage(appMessages.entities.users.single),
            plural: this.context.intl.formatMessage(appMessages.entities.users.plural),
          }}
          entityLinkTo="/users/"
        />
      </div>
    );
  }
}

UserList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  location: PropTypes.object.isRequired,
  dataReady: PropTypes.bool,
  entities: PropTypes.object.isRequired,
  taxonomies: PropTypes.object,
  connections: PropTypes.object,
};

UserList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: isReady(state, { path: [
    'users',
    'user_roles',
    'roles',
    'user_categories',
    'categories',
    'taxonomies',
  ] }),
  entities: selectUsers(state),
  taxonomies: selectTaxonomies(state),
  connections: selectConnections(state),
});
function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      dispatch(loadEntitiesIfNeeded('users'));
      dispatch(loadEntitiesIfNeeded('user_roles'));
      dispatch(loadEntitiesIfNeeded('roles'));
      dispatch(loadEntitiesIfNeeded('user_categories'));
      dispatch(loadEntitiesIfNeeded('categories'));
      dispatch(loadEntitiesIfNeeded('taxonomies'));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
