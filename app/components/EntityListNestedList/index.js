import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { List } from 'immutable';

import EntityListNestedItem from './EntityListNestedItem';
import EntityListNestedReportList from './EntityListNestedReportList';

const Styled = styled.span`
  display: inline-block;
  width: 50%;
  vertical-align: top;
`;
const ItemWrapper = styled.div`
  border-top: ${(props) => props.separated ? '1px solid' : 'none'};
  border-top-color: ${(props) => props.separated ? palette('light', 3) : 'transparent'};
  padding: ${(props) => props.separated ? '5px 0 20px' : '0 0 10px'};
  border-bottom: 1px solid transparent;
`;
export class EntityListNestedList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    const {
      entities,
      config,
      nestLevel,
      onExpand,
      onEntityClick,
      expandNo,
      isContributor,
    } = this.props;

    // const entityIcon = config.expandableColumns[nestLevel - 1].icon;
    return (
      <Styled>
        {
          entities.map((entity, i) =>
            <ItemWrapper key={i} separated={(expandNo - nestLevel) > 0 && i > 0}>
              <EntityListNestedItem
                entity={entity}
                expandNo={expandNo}
                nestLevel={nestLevel}
                config={config}
                onEntityClick={onEntityClick}
                onExpand={onExpand}
              />
              {expandNo > nestLevel && entity.get('expanded') && entity.get('expanded') === 'reports' && entity.get('reports') &&
                <EntityListNestedReportList
                  reports={entity.get('reports').toList()}
                  dates={entity.get('dates')}
                  onEntityClick={onEntityClick}
                  isContributor={isContributor}
                  nestLevel={nestLevel + 1}
                />
              }
            </ItemWrapper>
          )
        }
      </Styled>
    );
  }
}

EntityListNestedList.propTypes = {
  entities: PropTypes.instanceOf(List).isRequired,
  config: PropTypes.object,
  nestLevel: PropTypes.number,
  expandNo: PropTypes.number,
  onExpand: PropTypes.func,
  onEntityClick: PropTypes.func,
  isContributor: PropTypes.bool,
};

export default EntityListNestedList;
