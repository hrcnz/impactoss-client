/*
 *
 * IndicatorEdit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { actions as formActions } from 'react-redux-form/immutable';

import { Map, List, fromJS } from 'immutable';

import {
  userOptions,
  entityOptions,
  renderMeasureControl,
  renderSdgTargetControl,
  renderUserControl,
  validateRequired,
  validateDateFormat,
} from 'utils/forms';

import {
  getConnectionUpdatesFromFormData,
} from 'utils/entities';

import { getCheckedValuesFromOptions } from 'components/forms/MultiSelectControl';

import { PUBLISH_STATUSES, USER_ROLES, REPORT_FREQUENCIES, CONTENT_SINGLE } from 'containers/App/constants';
import appMessages from 'containers/App/messages';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updatePath,
  updateEntityForm,
} from 'containers/App/actions';

import {
  getEntity,
  getEntities,
  isReady,
} from 'containers/App/selectors';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityForm from 'components/forms/EntityForm';

import viewDomainSelect from './selectors';
import messages from './messages';
import { save } from './actions';

export class IndicatorEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    if (this.props.dataReady && this.props.indicator) {
      this.props.populateForm('indicatorEdit.form.data', this.getInitialFormData());
    }
  }

  componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // repopulate if new data becomes ready
    if (nextProps.dataReady && !this.props.dataReady && nextProps.indicator) {
      this.props.redirectIfNotPermitted();
      this.props.populateForm('indicatorEdit.form.data', this.getInitialFormData(nextProps));
    }
  }

  getInitialFormData = (nextProps) => {
    const props = nextProps || this.props;
    const { measures, indicator, users, sdgtargets } = props;
    indicator.attributes.frequency_months = indicator.attributes.frequency_months || 1;

    return indicator
    ? Map({
      id: indicator.id,
      attributes: fromJS(indicator.attributes),
      associatedMeasures: entityOptions(measures, true),
      associatedSdgTargets: entityOptions(sdgtargets, true),
      associatedUser: userOptions(users, indicator.attributes.manager_id),
      // TODO allow single value for singleSelect
    })
    : Map();
  }

  getHeaderMainFields = () => ([ // fieldGroups
    { // fieldGroup
      fields: [
        {
          id: 'reference',
          controlType: 'short',
          model: '.attributes.reference',
          label: this.context.intl.formatMessage(appMessages.attributes.referenceDefault),
          placeholder: this.context.intl.formatMessage(appMessages.placeholders.reference),
        },
        {
          id: 'title',
          controlType: 'titleText',
          model: '.attributes.title',
          label: this.context.intl.formatMessage(appMessages.attributes.title),
          placeholder: this.context.intl.formatMessage(appMessages.placeholders.title),
          validators: {
            required: validateRequired,
          },
          errorMessages: {
            required: this.context.intl.formatMessage(appMessages.forms.fieldRequired),
          },
        },
      ],
    },
  ]);

  getHeaderAsideFields = (entity) => ([
    {
      fields: [
        {
          id: 'status',
          controlType: 'select',
          model: '.attributes.draft',
          label: this.context.intl.formatMessage(appMessages.attributes.draft),
          value: entity.attributes.draft,
          options: PUBLISH_STATUSES,
        },
        {
          controlType: 'info',
          type: 'meta',
          fields: [
            {
              label: this.context.intl.formatMessage(appMessages.attributes.meta.updated_at),
              value: this.context.intl.formatDate(new Date(entity.attributes.updated_at)),
            },
            {
              label: this.context.intl.formatMessage(appMessages.attributes.meta.updated_by),
              value: entity.user && entity.user.attributes.name,
            },
          ],
        },
      ],
    },
  ]);

  getBodyMainFields = (measures, sdgtargets) => ([
    {
      fields: [
        {
          id: 'description',
          controlType: 'markdown',
          model: '.attributes.description',
          label: this.context.intl.formatMessage(appMessages.attributes.description),
          placeholder: this.context.intl.formatMessage(appMessages.placeholders.description),
        },
      ],
    },
    {
      label: this.context.intl.formatMessage(appMessages.entities.connections.plural),
      icon: 'connections',
      fields: [
        renderMeasureControl(measures),
        renderSdgTargetControl(sdgtargets),
      ],
    },
  ]);

  getBodyAsideFields = (entity, users) => ([ // fieldGroups
    { // fieldGroup
      label: this.context.intl.formatMessage(appMessages.entities.due_dates.schedule),
      icon: 'reminder',
      fields: [
        {
          id: 'start_date',
          controlType: 'date',
          model: '.attributes.start_date',
          label: this.context.intl.formatMessage(appMessages.attributes.start_date),
          placeholder: 'YYYY-MM-DD',
          validators: {
            date: validateDateFormat,
          },
          errorMessages: {
            date: this.context.intl.formatMessage(appMessages.forms.dateFormatError),
          },
        },
        {
          id: 'repeat',
          controlType: 'checkbox',
          model: '.attributes.repeat',
          label: this.context.intl.formatMessage(appMessages.attributes.repeat),
          value: entity.attributes.repeat,
        },
        {
          id: 'frequency',
          controlType: 'select',
          label: this.context.intl.formatMessage(appMessages.attributes.frequency_months),
          model: '.attributes.frequency_months',
          options: REPORT_FREQUENCIES,
          value: parseInt(entity.attributes.frequency_months, 10),
        },
        {
          id: 'end_date',
          controlType: 'date',
          model: '.attributes.end_date',
          label: this.context.intl.formatMessage(appMessages.attributes.end_date),
          placeholder: 'YYYY-MM-DD',
          validators: {
            date: validateDateFormat,
          },
          errorMessages: {
            date: this.context.intl.formatMessage(appMessages.forms.dateFormatError),
          },
        },
        renderUserControl(
          users,
          this.context.intl.formatMessage(appMessages.attributes.manager_id.indicators),
          entity.attributes.manager_id,
        ),
      ],
    },
  ]);

  getFields = (entity, measures, sdgtargets, users) => ({ // isManager, taxonomies,
    header: {
      main: this.getHeaderMainFields(),
      aside: this.getHeaderAsideFields(entity),
    },
    body: {
      main: this.getBodyMainFields(measures, sdgtargets),
      aside: this.getBodyAsideFields(entity, users),
    },
  })

  render() {
    const { indicator, dataReady, viewDomain, measures, users, sdgtargets } = this.props;
    const { saveSending, saveError } = viewDomain.page;

    return (
      <div>
        <Helmet
          title={`${this.context.intl.formatMessage(messages.pageTitle)}: ${this.props.params.id}`}
          meta={[
            { name: 'description', content: this.context.intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content>
          <ContentHeader
            title={this.context.intl.formatMessage(messages.pageTitle)}
            type={CONTENT_SINGLE}
            icon="indicators"
            buttons={
              indicator && dataReady ? [{
                type: 'cancel',
                onClick: this.props.handleCancel,
              },
              {
                type: 'save',
                onClick: () => this.props.handleSubmit(viewDomain.form.data, measures, sdgtargets),
              }] : null
            }
          />
          {saveSending &&
            <p>Saving</p>
          }
          {saveError &&
            <p>{saveError}</p>
          }
          { !indicator && !dataReady &&
            <Loading />
          }
          { !indicator && dataReady && !saveError &&
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          }
          {indicator && dataReady &&
            <EntityForm
              model="indicatorEdit.form.data"
              formData={viewDomain.form.data}
              handleSubmit={(formData) => this.props.handleSubmit(formData, measures, sdgtargets)}
              handleCancel={this.props.handleCancel}
              handleUpdate={this.props.handleUpdate}
              fields={this.getFields(indicator, measures, sdgtargets, users)}
            />
          }
        </Content>
      </div>
    );
  }
}

IndicatorEdit.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectIfNotPermitted: PropTypes.func,
  populateForm: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  indicator: PropTypes.object,
  dataReady: PropTypes.bool,
  params: PropTypes.object,
  measures: PropTypes.object,
  sdgtargets: PropTypes.object,
  users: PropTypes.object,
};

IndicatorEdit.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  viewDomain: viewDomainSelect(state),
  dataReady: isReady(state, { path: [
    'measures',
    'sdgtargets',
    'users',
    'user_roles',
    'indicators',
    'measure_indicators',
    'sdgtarget_indicators',
  ] }),

  indicator: getEntity(
    state,
    {
      id: props.params.id,
      path: 'indicators',
      out: 'js',
      extend: [
        {
          type: 'single',
          path: 'users',
          key: 'last_modified_user_id',
          as: 'user',
        },
      ],
    },
  ),

  // all recommendations, listing connection if any
  measures: getEntities(
    state,
    {
      path: 'measures',
      extend: {
        as: 'associated',
        path: 'measure_indicators',
        key: 'measure_id',
        reverse: true,
        where: {
          indicator_id: props.params.id,
        },
      },
    },
  ),
  // all recommendations, listing connection if any
  sdgtargets: getEntities(
    state,
    {
      path: 'sdgtargets',
      extend: {
        as: 'associated',
        path: 'sdgtarget_indicators',
        key: 'sdgtarget_id',
        reverse: true,
        where: {
          indicator_id: props.params.id,
        },
      },
    },
  ),

  // all users of role contributor
  users: getEntities(
    state,
    {
      path: 'users',
      connected: {
        path: 'user_roles',
        key: 'user_id',
        where: {
          role_id: USER_ROLES.CONTRIBUTOR, // contributors only
        },
      },
    },
  ),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      dispatch(loadEntitiesIfNeeded('measures'));
      dispatch(loadEntitiesIfNeeded('sdgtargets'));
      dispatch(loadEntitiesIfNeeded('users'));
      dispatch(loadEntitiesIfNeeded('user_roles'));
      dispatch(loadEntitiesIfNeeded('indicators'));
      dispatch(loadEntitiesIfNeeded('measure_indicators'));
      dispatch(loadEntitiesIfNeeded('sdgtarget_indicators'));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.MANAGER));
    },
    populateForm: (model, formData) => {
      // console.log('populateForm', formData)
      dispatch(formActions.load(model, formData));
    },
    handleSubmit: (formData, measures, sdgtargets) => {
      let saveData = formData
        .set(
          'measureIndicators',
          getConnectionUpdatesFromFormData({
            formData,
            connections: measures,
            connectionAttribute: 'associatedMeasures',
            createConnectionKey: 'measure_id',
            createKey: 'indicator_id',
          })
        )
        .set(
          'sdgtargetIndicators',
          getConnectionUpdatesFromFormData({
            formData,
            connections: sdgtargets,
            connectionAttribute: 'associatedSdgTargets',
            createConnectionKey: 'sdgtarget_id',
            createKey: 'indicator_id',
          })
        );

      // TODO: remove once have singleselect instead of multiselect
      const formUserIds = getCheckedValuesFromOptions(formData.get('associatedUser'));
      if (List.isList(formUserIds) && formUserIds.size) {
        saveData = saveData.setIn(['attributes', 'manager_id'], formUserIds.first());
      } else {
        saveData = saveData.setIn(['attributes', 'manager_id'], null);
      }

      // cleanup
      // default to database id
      const formRef = formData.getIn(['attributes', 'reference']) || '';
      if (formRef.trim() === '') {
        saveData = saveData.setIn(['attributes', 'reference'], formData.get('id'));
      }
      // do not store repeat fields when not repeat
      if (!saveData.getIn(['attributes', 'repeat'])) {
        saveData = saveData
          .setIn(['attributes', 'frequency_months'], null)
          .setIn(['attributes', 'end_date'], null);
      }
      dispatch(save(saveData.toJS()));
    },
    handleCancel: () => {
      dispatch(updatePath(`/indicators/${props.params.id}`));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorEdit);
