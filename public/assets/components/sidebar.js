import { createElement, onDestroy } from "../lib/skeleton/index.js";
import rxjs, { effect } from "../lib/rx.js";
import { fromHref, toHref } from "../lib/skeleton/router.js";
import { qs } from "../lib/dom.js";
import { animate, opacityIn } from "../lib/animate.js";
import { settingsGet, settingsSave } from "../lib/store.js";
import { loadCSS } from "../helpers/loader.js";
import t from "../locales/index.js";
import cache from "../pages/filespage/cache.js";
import { hooks } from "../pages/filespage/model_files.js";
import { extractPath, isDir, isNativeFileUpload } from "../pages/filespage/helper.js";
import { mv as mv$ } from "../pages/filespage/model_files.js";
import { mv as mvVL, withVirtualLayer } from "../pages/filespage/model_virtual_layer.js";

const state = { scrollTop: 100, $cache: null };
const mv = (from, to) => withVirtualLayer(
    mv$(from, to),
    mvVL(from, to),
);

export default async function ctrlSidebar(render) {
    if (new URL(location).searchParams.get("nav") === "false") return;

    const $page = render(createElement(`
        <div class="component_sidebar"><div>
            <h3>
                <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgYXJpYS1oaWRkZW49InRydWUiCiAgIGZvY3VzYWJsZT0iZmFsc2UiCiAgIHJvbGU9ImltZyIKICAgY2xhc3M9Im9jdGljb24gb2N0aWNvbi1zaWRlYmFyLWV4cGFuZCIKICAgdmlld0JveD0iMCAwIDE2IDE2IgogICB3aWR0aD0iMTYiCiAgIGhlaWdodD0iMTYiCiAgIGZpbGw9ImN1cnJlbnRDb2xvciIKICAgc3R5bGU9ImRpc3BsYXk6IGlubGluZS1ibG9jazsgdXNlci1zZWxlY3Q6IG5vbmU7IHZlcnRpY2FsLWFsaWduOiB0ZXh0LWJvdHRvbTsgb3ZlcmZsb3c6IHZpc2libGU7IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc3MjI3IgogICBzb2RpcG9kaTpkb2NuYW1lPSJnaXRodWJmb2xkLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS4yLjIgKGIwYTg0ODY1NDEsIDIwMjItMTItMDEpIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM3MjMxIiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpZD0ibmFtZWR2aWV3NzIyOSIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiMwMDAwMDAiCiAgICAgYm9yZGVyb3BhY2l0eT0iMC4yNSIKICAgICBpbmtzY2FwZTpzaG93cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VjaGVja2VyYm9hcmQ9IjAiCiAgICAgaW5rc2NhcGU6ZGVza2NvbG9yPSIjZDFkMWQxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIxNC43NSIKICAgICBpbmtzY2FwZTpjeD0iNC4yMDMzODk4IgogICAgIGlua3NjYXBlOmN5PSI4IgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTgxNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMzk3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI3IgogICAgIGlua3NjYXBlOndpbmRvdy15PSIzNCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzcyMjciIC8+CiAgPHBhdGgKICAgICBkPSJtNC4xNzcgNy44MjMgMi4zOTYtMi4zOTZBLjI1LjI1IDAgMCAxIDcgNS42MDR2NC43OTJhLjI1LjI1IDAgMCAxLS40MjcuMTc3TDQuMTc3IDguMTc3YS4yNS4yNSAwIDAgMSAwLS4zNTRaIgogICAgIGlkPSJwYXRoNzIyMyIKICAgICBzdHlsZT0iZmlsbDojNTc1OTVhO2ZpbGwtb3BhY2l0eToxIiAvPgogIDxwYXRoCiAgICAgZD0iTTAgMS43NUMwIC43ODQuNzg0IDAgMS43NSAwaDEyLjVDMTUuMjE2IDAgMTYgLjc4NCAxNiAxLjc1djEyLjVBMS43NSAxLjc1IDAgMCAxIDE0LjI1IDE2SDEuNzVBMS43NSAxLjc1IDAgMCAxIDAgMTQuMjVabTEuNzUtLjI1YS4yNS4yNSAwIDAgMC0uMjUuMjV2MTIuNWMwIC4xMzguMTEyLjI1LjI1LjI1SDkuNXYtMTNabTEyLjUgMTNhLjI1LjI1IDAgMCAwIC4yNS0uMjVWMS43NWEuMjUuMjUgMCAwIDAtLjI1LS4yNUgxMXYxM1oiCiAgICAgaWQ9InBhdGg3MjI1IgogICAgIHN0eWxlPSJmaWxsOiM1NzU5NWE7ZmlsbC1vcGFjaXR5OjEiIC8+Cjwvc3ZnPgo=" alt="close">
                ${t("Your Files")}
            </h3>
            <div data-bind="your-files"></div>

            <!--
            <h3>${t("Shared Drive")}</h3>
            <div></div>

            <h3>${t("Tags")}</h3>
            <div></div>
            -->
        </div></div>
    `));

    // feature: visibility of the sidebar
    const forceRefresh = () => window.dispatchEvent(new Event("resize"));
    const isVisible = () => settingsGet({ visible: true }, "sidebar").visible;
    if (isVisible() === false) $page.classList.add("hidden");
    effect(rxjs.merge(rxjs.fromEvent(window, "keydown")).pipe(
        rxjs.filter((e) => e.key === "b" && e.ctrlKey === true),
        rxjs.tap(() => {
            settingsSave({ visible: $page.classList.contains("hidden") }, "sidebar");
            isVisible() ? $page.classList.remove("hidden") : $page.classList.add("hidden");
            forceRefresh();
        }),
    ));
    effect(rxjs.merge(
        rxjs.fromEvent(window, "resize"),
        rxjs.of(null),
    ).pipe(rxjs.tap(() => {
        if (!isVisible()) $page.classList.add("hidden");
        else if (document.body.clientWidth < 1250) $page.classList.add("hidden");
        else $page.classList.remove("hidden");
    })));
    qs($page, `img[alt="close"]`).onclick = () => {
        settingsSave({ visible: false }, "sidebar");
        $page.classList.add("hidden");
        forceRefresh();
    };

    // feature: setup the DOM
    const $files = qs($page, `[data-bind="your-files"]`);
    if (state.$cache) {
        $files.replaceChildren(state.$cache);
        $page.firstElementChild.scrollTop = state.scrollTop;
    }
    onDestroy(() => {
        state.$cache = $files.firstElementChild.cloneNode(true);
        state.scrollTop = $page.firstElementChild.scrollTop
    });
    const chunk = new pathChunk();
    const arr = chunk.toArray();
    const $tree = document.createDocumentFragment();
    for (let i = 0; i<arr.length-1; i++) {
        const path = chunk.toString(i);
        try {
            const $list = await createListOfFiles(path, arr[i+1]);
            const $anchor = i === 0 ?
                  $tree :
                  qs($tree, `[data-path="${chunk.toString(i)}"]`);
            $anchor.appendChild($list);
        } catch(err) { console.error("ERROR", i, err) }
    }
    $files.replaceChildren($tree);
    $page.firstElementChild.scrollTop = state.scrollTop;
    qs($page, `[data-path="${chunk.toString()}"] a`).classList.add("active");

    // feature: smart refresh whenever something happen
    let cleaners = [];
    cleaners.push(hooks.ls.listen(async ({ path }) => {
        try {
            const $ul = qs($page, `[data-path="${path}"] ul`);
            const $list = await createListOfFiles(path);
            $ul.replaceWith($list);
        } catch (err) {}
    }));
    cleaners.push(hooks.mutation.listen(async ({ op, path }) => {
        if (["mv", "mkdir", "rm"].indexOf(op) === -1) return;
        try {
            const $ul = qs($page, `[data-path="${path}"] ul`);
            const $list = await createListOfFiles(path);
            $ul.replaceWith($list);
        } catch (err) {}
    }));
    onDestroy(() => cleaners.map((fn) => fn()));
}

async function createListOfFiles(path, currentName) {
    const r = await cache().get(path);
    const whats = r === null ? (currentName ? [currentName] : []) : r.files
          .filter(({ type, name }) => type === "directory" && name[0] !== ".")
          .map(({ name }) => name)
          .sort();
    const $ul = document.createElement("ul");
    for (let i=0; i<whats.length; i++) {
        const $li = createElement(`
            <li data-path="${path + whats[i] + "/"}" title="${path + whats[i] + "/"}">
                <a data-link href="${toHref("/files" + path) + whats[i] + "/"}">
                    <img class="component_icon" draggable="false" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgYXJpYS1oaWRkZW49InRydWUiCiAgIGZvY3VzYWJsZT0iZmFsc2UiCiAgIGNsYXNzPSJvY3RpY29uIG9jdGljb24tZmlsZS1kaXJlY3RvcnktZmlsbCIKICAgdmlld0JveD0iMCAwIDE2IDE2IgogICB3aWR0aD0iMTYiCiAgIGhlaWdodD0iMTYiCiAgIGZpbGw9ImN1cnJlbnRDb2xvciIKICAgc3R5bGU9ImRpc3BsYXk6IGlubGluZS1ibG9jazsgdXNlci1zZWxlY3Q6IG5vbmU7IHZlcnRpY2FsLWFsaWduOiB0ZXh0LWJvdHRvbTsgb3ZlcmZsb3c6IHZpc2libGU7IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxNTgiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImdpdGh1YmZvbGRlci5zdmciCiAgIGlua3NjYXBlOnZlcnNpb249IjEuMi4yIChiMGE4NDg2NTQxLCAyMDIyLTEyLTAxKSIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMTYyIiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpZD0ibmFtZWR2aWV3MTYwIgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzAwMDAwMCIKICAgICBib3JkZXJvcGFjaXR5PSIwLjI1IgogICAgIGlua3NjYXBlOnNob3dwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZWNoZWNrZXJib2FyZD0iMCIKICAgICBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjcxLjYyNSIKICAgICBpbmtzY2FwZTpjeD0iNy44MTE1MTgzIgogICAgIGlua3NjYXBlOmN5PSI4IgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMjAzNiIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMzk3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI3IgogICAgIGlua3NjYXBlOndpbmRvdy15PSIzNCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzE1OCIgLz4KICA8cGF0aAogICAgIGQ9Ik0xLjc1IDFBMS43NSAxLjc1IDAgMCAwIDAgMi43NXYxMC41QzAgMTQuMjE2Ljc4NCAxNSAxLjc1IDE1aDEyLjVBMS43NSAxLjc1IDAgMCAwIDE2IDEzLjI1di04LjVBMS43NSAxLjc1IDAgMCAwIDE0LjI1IDNINy41YS4yNS4yNSAwIDAgMS0uMi0uMWwtLjktMS4yQzYuMDcgMS4yNiA1LjU1IDEgNSAxSDEuNzVaIgogICAgIGlkPSJwYXRoMTU2IgogICAgIHN0eWxlPSJmaWxsOiM1NzU5NWE7ZmlsbC1vcGFjaXR5OjEiIC8+Cjwvc3ZnPgo=" alt="directory">
                    <div>${whats[i]}</div>
                </a>
            </li>
        `);
        $ul.appendChild($li);
        const $link = qs($li, "a");
        $link.ondrop = async (e) => {
            $link.classList.remove("highlight");
            const from = e.dataTransfer.getData("path");
            let to = $link.parentElement.getAttribute("data-path");
            const [fromBasepath, fromName] = extractPath(from);
            to += fromName;
            if (isDir(from)) to += "/";
            if (from === to) return;
            await mv(from, to).toPromise();
        };
        $link.ondragover = (e) => {
            if (isNativeFileUpload(e)) return;
            e.preventDefault();
            $link.classList.add("highlight");
        };
        $link.ondragleave = () => {
            $link.classList.remove("highlight");
        };
    }
    return $ul;
}

export function init() {
    return loadCSS(import.meta.url, "./sidebar.css");
}

class pathChunk {
    constructor() {
        this.pathname = [""].concat(fromHref(
            location.pathname.replace(new RegExp("[^/]*$"), "")
        ).split("/").slice(2));
    }

    toArray() {
        return this.pathname;
    }

    toString(i) {
        if (i >= 0) return this.pathname.slice(0,i+1).join("/") + "/";
        return this.pathname.join("/");
    }
}