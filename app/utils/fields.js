import { truncateText } from 'utils/string';
import { sortEntities } from 'utils/sort';
import { ACCEPTED_STATUSES } from 'containers/App/constants';
import { find } from 'lodash/collection';

export const getIdField = (entity) => ({
  controlType: 'info',
  type: 'reference',
  value: entity.get('id'),
  large: true,
});
export const getReferenceField = (entity, defaultToId) => {
  const value = defaultToId
    ? entity.getIn(['attributes', 'reference']) || entity.get('id')
    : entity.getIn(['attributes', 'reference']);
  if (!!value && value.trim().length > 0) {
    return ({
      controlType: 'info',
      type: 'reference',
      value,
      large: true,
    });
  }
  return false;
};
const getLinkAnchor = (url) =>
  truncateText(url.replace(/^https?:\/\//i, ''), 40);

export const getLinkField = (entity) => ({
  type: 'link',
  value: entity.getIn(['attributes', 'url']),
  anchor: getLinkAnchor(entity.getIn(['attributes', 'url'])),
});
export const getEntityLinkField = (entity, path, label) => ({
  type: 'link',
  internal: true,
  value: `${path}/${entity.get('id')}`,
  anchor: entity.getIn(['attributes', 'title']) || entity.getIn(['attributes', 'name']),
  label,
});

export const getTitleField = (entity, isManager, attribute = 'title', label) => ({
  type: 'title',
  value: entity.getIn(['attributes', attribute]),
  isManager,
  label,
});
export const getStatusField = (entity, attribute = 'draft', options, label) => ({
  controlType: 'info',
  type: 'status',
  value: entity ? entity.getIn(['attributes', attribute]) : true,
  options,
  label,
});

// only show the highest rated role (lower role ids means higher)
const getHighestUserRoleLabel = (roles, formatMessage, appMessages) => {
  const highestRole = roles.reduce((currentHighestRole, role) =>
  (!currentHighestRole || role.get('id') < currentHighestRole.get('id'))
    ? role
    : currentHighestRole
  , null);
  return highestRole
  ? highestRole.getIn(['attributes', 'friendly_name'])
  : formatMessage(appMessages.entities.roles.defaultRole);
};

export const getRoleField = (entity, formatMessage, appMessages) => ({
  controlType: 'info',
  type: 'role',
  value: entity.get('roles')
    && getHighestUserRoleLabel(entity.get('roles'), formatMessage, appMessages),
});

export const getMetaField = (entity, appMessages) => ({
  controlType: 'info',
  type: 'meta',
  fields: [
    {
      label: appMessages.attributes.meta.updated_at,
      value: entity.getIn(['attributes', 'updated_at']),
      date: true,
    },
    {
      label: appMessages.attributes.meta.updated_by,
      value: entity.get('user') && entity.getIn(['user', 'attributes', 'name']),
    },
  ],
});

export const getMarkdownField = (entity, attribute, hasLabel, appMessages) =>
  !!entity.getIn(['attributes', attribute]) &&
  (entity.getIn(['attributes', attribute]).trim().length > 0) &&
  ({
    type: 'markdown',
    value: entity.getIn(['attributes', attribute]),
    label: hasLabel && appMessages.attributes[attribute],
  });

export const getDateField = (entity, attribute, appMessages, showEmpty, emptyMessage) =>
  (showEmpty || (
    !!entity.getIn(['attributes', attribute]) &&
    (entity.getIn(['attributes', attribute]).trim().length > 0)
  )) &&
  ({
    type: 'date',
    value: !!entity.getIn(['attributes', attribute]) && entity.getIn(['attributes', attribute]),
    label: appMessages.attributes[attribute],
    showEmpty: showEmpty && (emptyMessage || appMessages.attributes[`${attribute}_empty`]),
  });

export const getDateRelatedField = (value, attribute, appMessages, showEmpty, emptyMessage) =>
  (showEmpty || (!!value && (value.trim().length > 0))) &&
  ({
    type: 'date',
    value: !!value && value,
    label: appMessages.attributes[attribute],
    showEmpty: showEmpty && (emptyMessage || appMessages.attributes[`${attribute}_empty`]),
  });

export const getTextField = (entity, attribute, appMessages) =>
  !!entity.getIn(['attributes', attribute]) &&
  (entity.getIn(['attributes', attribute]).trim().length > 0) &&
  ({
    type: 'text',
    value: entity.getIn(['attributes', attribute]),
    label: appMessages.attributes[attribute],
  });

const mapCategoryOptions = (categories) => categories
  ? sortEntities(
      categories,
      'asc',
      'referenceThenTitle',
    )
    .map((cat) => ({
      label: cat.getIn(['attributes', 'title']),
      reference: cat.getIn(['attributes', 'reference']) || null,
      linkTo: `/category/${cat.get('id')}`,
    }))
    .toArray()
  : [];

const mapReports = (reports) => reports
  ? reports.map((report) => ({
    label: report.getIn(['attributes', 'title']),
    dueDate: report.get('due_date') ? report.getIn(['due_date', 'attributes', 'due_date']) : null,
    linkTo: `/reports/${report.get('id')}`,
  })).toArray()
  : [];

export const getReportsField = (reports, appMessages, button) => ({
  type: 'reports',
  values: mapReports(reports),
  button: button || null,
  showEmpty: true,
});

const mapDates = (dates) => dates
  ? dates.map((date) => ({
    date: date.getIn(['attributes', 'due_date']),
    due: date.getIn(['attributes', 'due']),
    overdue: date.getIn(['attributes', 'overdue']),
  })).toArray()
  : [];

export const getScheduleField = (dates) => ({
  type: 'schedule',
  values: mapDates(dates),
});

export const getTaxonomyFields = (taxonomies, appMessages) =>
  taxonomies && taxonomies.map((taxonomy) => ({
    type: 'list',
    label: appMessages.entities.taxonomies[taxonomy.get('id')].plural,
    entityType: 'taxonomies',
    id: taxonomy.get('id'),
    values: mapCategoryOptions(taxonomy.get('categories')),
  })).toArray();

const getCategoryShortTitle = (category) => {
  const title = (
    category.getIn(['attributes', 'short_title'])
    && (category.getIn(['attributes', 'short_title']).trim().length > 0)
  )
    ? category.getIn(['attributes', 'short_title'])
    : category.getIn(['attributes', 'title']);
  return truncateText(title, 10);
};

export const getCategoryShortTitleField = (entity) => ({
  type: 'short_title',
  value: getCategoryShortTitle(entity),
  taxonomyId: entity.getIn(['attributes', 'taxonomy_id']),
});

const getConnectionField = ({
  entities,
  taxonomies,
  connections,
  connectionOptions,
  entityType,
  entityIcon,
  entityPath,
  appMessages,
  onEntityClick,
}) => ({
  type: 'connections',
  values: entities.toList(),
  taxonomies,
  connections,
  entityType,
  entityIcon,
  entityPath: entityPath || entityType,
  onEntityClick,
  showEmpty: appMessages.entities[entityType].empty,
  connectionOptions: connectionOptions.map((option) => ({
    label: appMessages.entities[option].plural,
    path: option,
    clientPath: option === 'measures' ? 'actions' : option,
  })),
});

export const getIndicatorConnectionField = (entities, connections, appMessages, onEntityClick) =>
  getConnectionField({
    entities: sortEntities(entities, 'asc', 'reference'),
    taxonomies: null,
    connections,
    connectionOptions: ['measures', 'sdgtargets'],
    entityType: 'indicators',
    appMessages,
    onEntityClick,
  });

export const getRecommendationConnectionField = (entities, taxonomies, connections, appMessages, onEntityClick) =>
  getConnectionField({
    entities: sortEntities(entities, 'asc', 'reference'),
    taxonomies,
    connections,
    connectionOptions: ['measures'],
    entityType: 'recommendations',
    appMessages,
    onEntityClick,
    entityIcon: (entity) => {
      const status = find(ACCEPTED_STATUSES,
        (option) => option.value === entity.getIn(['attributes', 'accepted'])
      );
      return status ? status.icon : null;
    },
  });

export const getSdgTargetConnectionField = (entities, taxonomies, connections, appMessages, onEntityClick) =>
  getConnectionField({
    entities: sortEntities(entities, 'asc', 'reference'),
    taxonomies,
    connections,
    connectionOptions: ['indicators', 'measures'],
    entityType: 'sdgtargets',
    appMessages,
    onEntityClick,
  });

export const getMeasureConnectionField = (entities, taxonomies, connections, appMessages, onEntityClick) =>
  getConnectionField({
    entities: sortEntities(entities, 'asc', 'id'),
    taxonomies,
    connections,
    connectionOptions: ['indicators', 'recommendations', 'sdgtargets'],
    entityType: 'measures',
    entityPath: 'actions',
    appMessages,
    onEntityClick,
  });

export const getManagerField = (entity, messageLabel, messageEmpty) =>
  ({
    label: messageLabel,
    type: 'manager',
    value: entity.get('manager') && entity.getIn(['manager', 'attributes', 'name']),
    showEmpty: messageEmpty,
  });

export const getDownloadField = (entity, isManager, appMessages) => ({
  type: 'download',
  value: entity.getIn(['attributes', 'document_url']),
  isManager,
  public: entity.getIn(['attributes', 'public']),
  showEmpty: appMessages.attributes.documentEmpty,
});

export const getEmailField = (entity) => ({
  type: 'email',
  value: entity.getIn(['attributes', 'email']),
});
