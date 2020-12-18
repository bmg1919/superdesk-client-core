import {gettext} from 'core/utils';
import {reactToAngular1} from 'superdesk-ui-framework';
import {MasterDesk} from './MasterDesk';

const styles = 'margin-top: 48px';

angular.module('superdesk.apps.master-desk', [])
    .component('sdMasterDesk', reactToAngular1(MasterDesk, [], ['desks', 'api', 'tasks', 'preferencesService'], styles))
    .config(['superdeskProvider', 'workspaceMenuProvider', (superdesk, workspaceMenuProvider) => {
        superdesk
            .activity('/master-desk/', {
                label: gettext('Master Desk'),
                priority: 100,
                template: require('./views/master-desk.html'),
                sideTemplateUrl: 'scripts/apps/workspace/views/workspace-sidenav.html',
                privileges: {desks: 1},
            });

        workspaceMenuProvider.item({
            if: 'privileges.desks',
            icon: 'master',
            href: '/master-desk',
            label: gettext('Master Desk'),
            order: 1000,
        });
    }]);
