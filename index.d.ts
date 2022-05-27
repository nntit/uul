import uWebSockets from 'uWebSockets.js';

export interface TemplatedApp {
    /** Listens to hostname & port. Callback hands either false or a listen socket. */
    listen(host: RecognizedString, port: number, cb: (listenSocket: us_listen_socket) => void): TemplatedApp;
    /** Listens to port. Callback hands either false or a listen socket. */
    listen(port: number, cb: (listenSocket: any) => void): TemplatedApp;
    /** Listens to port and sets Listen Options. Callback hands either false or a listen socket. */
    listen(port: number, options: ListenOptions, cb: (listenSocket: us_listen_socket | false) => void): TemplatedApp;
    /** Registers an HTTP GET handler matching specified URL pattern. */
    get(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP POST handler matching specified URL pattern. */
    post(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP OPTIONS handler matching specified URL pattern. */
    options(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP DELETE handler matching specified URL pattern. */
    del(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP PATCH handler matching specified URL pattern. */
    patch(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP PUT handler matching specified URL pattern. */
    put(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP HEAD handler matching specified URL pattern. */
    head(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP CONNECT handler matching specified URL pattern. */
    connect(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP TRACE handler matching specified URL pattern. */
    trace(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers an HTTP handler matching specified URL pattern on any HTTP method. */
    any(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
    /** Registers a handler matching specified URL pattern where WebSocket upgrade requests are caught. */
    ws(pattern: RecognizedString, behavior: WebSocketBehavior): TemplatedApp;
    /** Publishes a message under topic, for all WebSockets under this app. See WebSocket.publish. */
    publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
    /** Returns number of subscribers for this topic. */
    numSubscribers(topic: RecognizedString): number;
    /** Adds a server name. */
    addServerName(hostname: string, options: AppOptions): TemplatedApp;
    /** Removes a server name. */
    removeServerName(hostname: string): TemplatedApp;
    /** Registers a synchronous callback on missing server names. See /examples/ServerName.js. */
    missingServerName(cb: (hostname: string) => void): TemplatedApp;
}

export function uul(options?: AppOptions): TemplatedApp;
