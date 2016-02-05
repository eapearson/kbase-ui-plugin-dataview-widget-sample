
/* DOC: jslint configuration
 * The following two comment sections are instructions to jslint, to 
 * provide exceptions to allow for less noisy but still useful linting.
 */
/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */

/* DOC: requirejs define
 * Note that this is an anonymous define. The module name for this panel is 
 * provided in require-config.js, which associates a string key with this module file.
 * The only dependency required to implement a panel is a promises library,
 * in this case Q (cit. here).
 * It is very commong to have jquery and kb.html also included, as they
 * assist greatly in building html and manipulating the DOM, and kb.runtime
 * since it is the primary interface to the user interface runtime.
 * In addition, any widgets will need to be included here as well.
 * (Well, some usage patterns may load widgets in a different way, but this
 *  sample panel represents a moderately straightforward implementation.)
 *  
 *  Formatting: I find that listing each module name on a separate line 
 *  enhances readability.
 * 
 */

/* @typedef Panel
 * @type {object}
 * @method {undefined} setup
 * @method {undefined} teardown
 * 
 */

/* 
 * Sample panel module.
 * @module {Panel} panel/sample
 * 
 */
define([
    'kb/common/html',
    'kb/common/dom',
    'kb/widget/widgetSet'
],
    function (html, dom, WidgetSet) {
        /* DOC: strict mode
         * We always set strict mode with the following magic javascript
         * incantation.
         */
        'use strict';
        
        function widget(config) {
            /* DOC: widget variables and factory pattern
             * In the factory pattery for object creation, we can just
             * declare variables within the factory function, and they 
             * are naturally available to all functions defined within.
             * 
             * In this case we need to store references to the original 
             * DOM node passed during attachment (mount), the DOM node
             * created by the Panel for its own use (container),
             * and an array of subwidgets (children).
             */
            var runtime = config.runtime,
                mount, container,
                widgetSet = WidgetSet.make({runtime: runtime}),
                // html elements used
                t = html.tag,
                div = t('div'), h1 = t('h1'), p = t('p');

            /* DOC helper functions
             * Although not part of the Panel Interface, a common pattern is
             * to have a sert of helper functions. This assists in meeting 
             * the coding standard of short, understandable, single-purposed
             * functions.
             * A very common helper funcion is a renderer. A panel may have 
             * more then one render function, e.g. to represent different
             * states. In this case, the render function simply builds a
             * layout upon which it will attache widgets.
             * 
             */
            function render() {
                /*
                 * DOC: html helper module
                 * The kb.html helper module is quite useful for building 
                 * html in a functional style. It has a generic tag function
                 * builder, as well as methods to build more complex html
                 * structures.
                 */

                /* DOC: return some structure
                 * The render function returns enough structure to represent
                 * what needs to be rendered. This is not hard-coded at all, 
                 * and is just a convention within this panel. It has turned
                 * out, however, to be a useful pattern.
                 */
                return div({class: ['kb-panel-sample', 'container-fluid']}, [
                    div({class: 'container-fluid'}, [
                        div({class: 'col-md-12'}, h1('Sample Panel and Widgets')),
                        div({class: 'col-md-8'}, [
                            p('This panel contains sample widgets.')
                        ]),
                        div({class: 'col-md-4'}, [
                            p('How interesting...')
                        ]),
                        div({class: 'col-md-6'}, [
                            html.makePanel({
                                title: 'Sample Widget One',
                                content: div([
                                    p('This is a sample widget which fetches and displays the "workspace info" for this object.'),
                                    div({id: widgetSet.addWidget('dataview_workspaceInfo')})
                                ])
                            }),
                            html.makePanel({
                                title: 'Another',
                                content: 'Coming soon...'
                            })
                        ]),
                         div({class: 'col-md-6'}, [
                            html.makePanel({
                                title: 'Sample Widget 2',
                                content: div({id: widgetSet.addWidget('dataview_objectInfo')})
                            }),
                            html.makePanel({
                                title: 'Another',
                                content: 'Coming soon...'
                            })
                        ])
                    ])
                ]);
            }

            /* DOC: attach event
             * This attach() function implements the attach lifecycle event
             * in the Panel Widget lifecycle interface.
             * It is invoked at  point at which the parent environment has
             * obtained a concerete DOM node at which to attach this Panel,
             * and is ready to allow the Panel to attach itself to it.
             * The Panel should not do anything with the provided node
             * other than attach its own container node. This is because 
             * in some environments, it may be that the provided node is
             * long lived. A panel should not, for example, attach DOM listeners
             * to it.
             * 
             */
            function attach(node) {
                /* DOC: creating our attachment point
                 *  Here we save the provided node in the mount variable,
                 *  and attach our own container node to it. This pattern
                 *  allows us to attach event listeners as we wish to 
                 *  our own container, so that we have more control
                 *  over it. E.g. we can destroy and recreate it if we
                 *  want another set of event listeners and don't want
                 *  to bother with managing them all individually.
                 */
                mount = node;
                container = dom.createElement('div');
                mount.appendChild(container);

                /* DOC: dom access
                 * In this case we are keeping things simple by using 
                 * the plain DOM API. We could also use jquery 
                 * here if we wish to.
                 */
                container.innerHTML = render();

                /* DOC: runtime interface
                 * Since a panel title is also, logically, the title of
                 * the "page" we use the runtimes event bus to emit the
                 * 'title' event to the application. The application 
                 * takes care of modifying the window panel to accomodate
                 * it.
                 */
                runtime.send('ui', 'setTitle', 'Sample Dataview-friendly Widgets');

                /* DOC: implement widget manager attach lifecycle event
                 * Okay, here we run all of the widgets through the 
                 * 
                 */
                return widgetSet
                    .init(config)
                    .then(function () {
                        return widgetSet.attach(node);
                    });
            }
            function start(params) {
                return widgetSet.start(params);
            }
            function run(params) {
                return widgetSet.run(params);
            }
            function stop() {
                return widgetSet.stop();
            }
            function detach() {
                return widgetSet.detach();
            }
            function destroy() {
                return widgetSet.destroy();
            }

            return {
                attach: attach,
                start: start,
                run: run,
                stop: stop,
                detach: detach,
                destroy: destroy
            };
        }

        return {
            make: function (config) {
                return widget(config);
            }
        };
    });