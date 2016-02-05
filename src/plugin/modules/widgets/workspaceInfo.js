/*global define */
/*jslint white: true, browser: true */
define([
    'kb/common/html',
    'kb/service/client/workspace',
    'kb/service/client/fba',
    'kb/service/utils',
    '../utils'
],
    function (html, Workspace, Fba, apiUtils, utils) {
        'use strict';

        function factory(config) {
            var parent, container, runtime = config.runtime,
                t = html.tag, ol = t('ol'),
                li = t('li'),
                a = t('a'),
                div = t('div'),
                pre = t('pre');

            // VIEW

            function layout() {
                return html.makePanel({
                    title: 'Workspace Info',
                    content: div([                        
                        div({dataElement: 'workspaceInfo'}, html.loading())
                    ])
                });
            }
            
            function renderWorkspaceInfo(workspaceInfo) {
                var content = utils.formatValue(workspaceInfo);
                container.querySelector('[data-element="workspaceInfo"]').innerHTML = content;
            }
            
            

            // WIDGET API

            function attach(node) {
                parent = node;
                container = parent.appendChild(document.createElement('div'));
                container.innerHTML = layout();
            }

            function start(params) {
                /* Need to create the taxon client object here because it requires params.
                 * The params is determined by the dataview route, which makes
                 * available:
                 *   workspaceId
                 *   objectId
                 *   objectVersion
                 *   ...
                 */
                var workspace = new Workspace(runtime.getConfig('services.workspace.url'), {
                    token: runtime.service('session').getAuthToken()
                });
                
                return workspace.get_workspace_info(utils.workspaceIdentity(params))
                    .then(function (workspaceInfo) {
                        renderWorkspaceInfo(apiUtils.workspaceInfoToObject(workspaceInfo));
                    });
            }

            function stop() {
                // nothing to do
                // typically this is where one would 
            }

            function detach() {
                // nothing to do necessarily, since the parent dom node will
                // be removed the controller for this widget removes it, 
                // but it is nice to take responsibility for undoing what we
                // changed in the parent node:
                if (parent && container) {
                    container.innerHTML = '';
                    parent.removeChild(container);
                }
            }

            return Object.freeze({
                attach: attach,
                start: start,
                stop: stop,
                detach: detach
            });
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });