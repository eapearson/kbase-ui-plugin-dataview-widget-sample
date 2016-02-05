/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'kb/common/html',
    'kb/service/client/workspace',
    'kb/service/client/fba',
    'kb/service/utils',
    '../utils'
],
    function (Promise, html, Workspace, Fba, apiUtils, utils) {
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
                    title: 'Object Info',
                    content: div([
                        div({dataElement: 'objectInfo'}, html.loading())
                    ])
                });
            }

            function renderObjectInfo(objectInfo) {
                var content = utils.formatValue(objectInfo);
                container.querySelector('[data-element="objectInfo"]').innerHTML = content;
            }

            function renderObjectInfoError(err) {
                var message = err.message || err.error.message;
                var content = 'Error: ' + message;
                container.querySelector('[data-element="objectInfo"]').innerHTML = content;
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
                // NB: if you want to handle errors locally, you need to catch
                // them locally. The calling environment, in this case the demo panel,
                // will otherwise in turn throw the error and the main ui will 
                // display an error message in the panel.
                return Promise.try(function () {
                    var workspace = new Workspace(runtime.getConfig('services.workspace.url'), {
                        token: runtime.service('session').getAuthToken()
                    });

                    return workspace.get_object_info_new({
                        objects: [utils.objectIdentity(params)],
                        ignoreErrors: 0,
                        includeMetadata: 1
                    })
                        .then(function (workspaceInfo) {                           
                            renderObjectInfo(apiUtils.objectInfoToObject(workspaceInfo[0]));
                        });
                    })
                    .catch(function (err) {
                        console.error(err);
                        renderObjectInfoError(err);
                        return null;
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