export enum JobTypes {
  Harvest,
  Deliver,
  None
}

export class HarvestJob {
  public static checkComplete(creep: Creep): boolean {
    return creep.store.getFreeCapacity() === 0;
  }

  private static decodeMemory(memory: any): Source | null {
    if ("sourceId" in memory) {
      return Game.getObjectById(memory.sourceId) as Source;
    } else return null;
  }

  public static run(creep: Creep, memory: any) {
    let source = this.decodeMemory(memory);
    if (!source) return;

    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      if (creep.moveTo(source) == ERR_NO_PATH) {
        return;
      }
    }
  }

  public static saveMemory(creep: Creep, memory: any) {
    return { sourceId: this.decodeMemory(memory) };
  }

  public static createMemory(creep: Creep) {
    let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (!source) return null;

    return { sourceId: source.id };
  }
}

export class DeliverJob {
  public static checkComplete(creep: Creep): boolean {
    return creep.store.getUsedCapacity() === 0;
  }

  private static decodeMemory(memory: any): StructureSpawn | StructureExtension | StructureTower | StructureStorage | StructureContainer | Structure | null {
    if ("targetId" in memory) {
      return Game.getObjectById(memory.targetId) as StructureSpawn | StructureExtension | StructureTower | StructureStorage | StructureContainer | Structure;
    } else return null;
  }

  public static run(creep: Creep, memory: any) {
    let target = this.decodeMemory(memory);
    if (!target) return;

    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  }

  public static createMemory(creep: Creep) {
    let target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    if (!target) return;

    return { targetId: target.id };
  }

  public static saveMemory(creep: Creep, memory: any) {
    return { targetId: this.decodeMemory(memory) };
  }
}
