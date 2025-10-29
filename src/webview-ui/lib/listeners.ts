import { queryClient } from "@webview/controller/query-client";
import { WebViewEvent } from "@src/types/event";
import { promiseController } from "@webview/controller/promise-controller";

let isAttached = false;
let detachFns: (() => void)[] = [];

export function startListeners() {
  if (isAttached) return;
  isAttached = true;

  const detachTheme = attach("UPDATE_THEME_COLORS", (payload) => {
    if (payload)
      queryClient.setData({
        command: "GET_THEME_COLORS",
        data: payload,
      });
  });

  const detachThemeList = attach("UPDATE_THEME_LIST", (payload) => {
    if (payload)
      queryClient.setData({
        command: "GET_THEME_LIST",
        data: payload,
      });
  });
  const detachFontAndLayout = attach(
    "UPDATE_FONT_AND_LAYOUT_SETTINGS",
    (payload) => {
      if (payload)
        queryClient.setData({
          command: "GET_FONT_AND_LAYOUT_SETTINGS",
          data: payload,
        });
    }
  );
  const detachAuthUser = attach("UPDATE_AUTH_USER", (payload) => {
    if (payload)
      queryClient.setData({
        command: "GET_AUTH_USER",
        data: payload,
      });
  });

  detachFns = [
    detachTheme,
    detachThemeList,
    detachFontAndLayout,
    detachAuthUser,
  ];
}

export function stopListeners() {
  detachFns.forEach((fn) => fn());
  detachFns = [];
  isAttached = false;
}

// helper
function attach<T extends keyof WebViewEvent>(
  event: T,
  handler: (payload: WebViewEvent[T]["payload"]) => void
) {
  promiseController.on(event, handler);
  return () => promiseController.off(event);
}
