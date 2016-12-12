const Command = require('./command');
const SourceViewer = require('./sourceViewer');
const $dom = $('#resources');

const ResourceViewer = {
    selectedUrl: null,
    resources: null,
    render(resources){
        let html = resources.resources.filter(item => item.type === 'Script')
            .map(item => {
                let fileName = item.url.split('/').slice(-1)[0];
                return `<span class="nav-group-item ${item.url === this.selectedUrl ? 'active': ''} resource-file" title="${item.url}">
                    ${fileName}
                  </span>`;
            });
        $dom.html(html);

        this.resources = resources;
    }
};

$(document).on('click', '.resource-file', (e) => {
    let $target = $(e.target);
    let url = $target.attr('title');
    Command('Page.getResourceContent', {
        frameId: ResourceViewer.resources.frame.id,
        url
    }).then(SourceViewer.render.bind(SourceViewer, url));
    $target.siblings().removeClass('active');
    $target.addClass('active');
});

module.exports = ResourceViewer;