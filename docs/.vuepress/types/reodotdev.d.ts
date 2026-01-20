declare module "reodotdev" {
  export type ReoClient = {
    init: (options: { clientID: string }) => void;
    [key: string]: unknown;
  };

  export function loadReoScript(options: {
    clientID: string;
    scriptUrlPattern?: string | string[];
    version?: string;
  }): Promise<ReoClient>;
}

