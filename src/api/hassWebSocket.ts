// Home Assistant types

export type HassEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}; 