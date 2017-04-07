import React from 'react';
import {TypeIcon} from 'apps/search/components';
import classNames from 'classnames';

export function GridTypeIcon(props) {
    return React.createElement(
        'span',
        {className: classNames('type-icon', {swimlane: props.swimlane})},
        React.createElement(TypeIcon, {type: props.item.type, svc: props.svc})
    );
}

GridTypeIcon.propTypes = {
    svc: React.PropTypes.object.isRequired,
    swimlane: React.PropTypes.any,
    item: React.PropTypes.any
};
