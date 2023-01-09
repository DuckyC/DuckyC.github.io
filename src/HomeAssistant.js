import { getAuth, callService, createConnection, ERR_HASS_HOST_REQUIRED, subscribeEntities } from "home-assistant-js-websocket";

export class HomeAssistantConnectedEvent extends Event {
  static type = "HomeAssistantConnectedEvent";
  constructor(connection) {
    super(HomeAssistantConnectedEvent.type);
    this.connection = connection;
  }
}

export class HomeAssistantDisconnectedEvent extends Event {
  static type = "HomeAssistantDisconnectedEvent";
  constructor(connection) {
    super(HomeAssistantDisconnectedEvent.type);
    this.connection = connection;
  }
}

export class HomeAssistant extends EventTarget {
  constructor() {
    super()
    this.authOptions = {
      async loadTokens() {
        try {
          return JSON.parse(localStorage.hassTokens);
        } catch (err) {
          return undefined;
        }
      },
      saveTokens: (tokens) => {
        localStorage.hassTokens = JSON.stringify(tokens);
      },
    };

    this.lights = [];

    setInterval(async () => await this.tick(), 100);
  }

  async load() {
    try {
      this.auth = await getAuth(this.authOptions);
      // Clear url if we have been able to establish a connection
      if (location.search.includes("auth_callback=1")) {
        history.replaceState(null, "", location.pathname);
      }

      this.connection = await createConnection({ auth: this.auth });

      subscribeEntities(this.connection, (entities) => {
        this.lights = Object.keys(entities).filter(entityId => entityId.startsWith("light."));
        console.log(this.lights);
      });

      this.dispatchEvent(new HomeAssistantConnectedEvent(this.connection));

      // To play from the console
      window.auth = this.auth;
      window.connection = this.connection;
    } catch (err) {
      if (err !== ERR_HASS_HOST_REQUIRED) {
        console.error(err);
      }
    }
  }

  async authenticate() {
    try {
      this.auth = await getAuth(this.authOptions);
    } catch (err) {
      if (err === ERR_HASS_HOST_REQUIRED) {
        this.authOptions.hassUrl = prompt("What host to connect to?", "http://192.168.0.10:8123");
        if (!authOptions.hassUrl) return;
        this.auth = await getAuth(this.authOptions);
      } else {
        alert(`Unknown error: ${err}`);
        return;
      }
    }
    await this.load();
  }

  async disconnect() {
    if (this.connection) {
      if (this.entityId) {
        await callService(
          this.connection,
          "light",
          "turn_on",
          {
            rgb_color: [255,202,123],
            brightness: 100,
            transition: false,
          },
          {
            entity_id: this.entityId,
          }
        );
      }

      this.connection.close();
      this.dispatchEvent(new HomeAssistantDisconnectedEvent(this.connection));
      delete this.connection;
      delete this.auth;
    }
  }

  setEntity(entityId) {
    this.entityId = entityId;
  }

  setColor(color) {
    this.color = color;
  }

  async tick() {
    if (
      this.connection &&
      this.color &&
      (!this.lastColor || this.lastColor[0] !== this.color[0] || this.lastColor[1] !== this.color[1] || this.lastColor[2] !== this.color[2])
    ) {
      this.lastColor = this.color;
      await callService(
        this.connection,
        "light",
        "turn_on",
        {
          rgb_color: this.color,
          brightness: this.color[0] + this.color[1] + this.color[2] == 0 ? "0" : "255",
          transition: false,
        },
        {
          entity_id: this.entityId,
        }
      );
    }
  }
}
