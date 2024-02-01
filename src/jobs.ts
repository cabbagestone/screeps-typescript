export enum JobTypes {
  Harvest,
  Deliver,
  UpgradeController,
  None
}

export class JobUtility {
  public static AssignRequiredJob(creep: Creep) {
    if (creep.store.getFreeCapacity() === 0) {
      creep.room.energyAvailable != creep.room.energyCapacityAvailable || Math.random() < .5 ? DeliverJob.assign(creep) : UpgradeControllerJob.assign(creep);
    } else {
      return HarvestJob.assign(creep);
    }
  }
}

class Job {
  public static assign(creep: Creep) {}
  public static checkComplete(creep: Creep): boolean {
    return true;
  }
  public static run(creep: Creep) {}
  public static saveMemory(creep: Creep) {}
  public static createMemory(creep: Creep) {}
}

export class UpgradeControllerJob extends Job {
  public static assign(creep: Creep) {
    creep.memory.currentJob = JobTypes.UpgradeController;
    creep.memory.jobMemory = this.createMemory(creep);
  }

  public static checkComplete(creep: Creep): boolean {
    return creep.store.getUsedCapacity() === 0;
  }

  private static decodeMemory(memory: any): StructureController | null {
    if ("controllerId" in memory) {
      return Game.getObjectById(memory.controllerId) as StructureController;
    } else return null;
  }

  public static run(creep: Creep) {
    if (this.checkComplete(creep)) JobUtility.AssignRequiredJob(creep);
    let controller = this.decodeMemory(creep.memory.jobMemory);
    if (!controller) return;

    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    }
  }

  public static saveMemory(creep: Creep) {
    return { controllerId: this.decodeMemory(creep.memory.jobMemory) };
  }

  public static createMemory(creep: Creep) {
    let controller = creep.room.controller;
    console.log(controller);
    if (!controller) return;

    return { controllerId: controller.id };
  }
}

export class HarvestJob extends Job {
  public static assign(creep: Creep) {
    creep.memory.currentJob = JobTypes.Harvest;
    creep.memory.jobMemory = this.createMemory(creep);
  }

  public static checkComplete(creep: Creep): boolean {
    return creep.store.getFreeCapacity() === 0;
  }

  private static decodeMemory(memory: any): Source | null {
    if ("sourceId" in memory) {
      return Game.getObjectById(memory.sourceId) as Source;
    } else return null;
  }

  public static run(creep: Creep) {
    if (this.checkComplete(creep)) JobUtility.AssignRequiredJob(creep);
    let source = this.decodeMemory(creep.memory.jobMemory);
    if (!source) return;

    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      if (creep.moveTo(source) == ERR_NO_PATH) {
        return;
      }
    }
  }

  public static saveMemory(creep: Creep) {
    return { sourceId: this.decodeMemory(creep.memory.jobMemory) };
  }

  public static createMemory(creep: Creep) {
    let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (!source) return null;

    return { sourceId: source.id };
  }
}

export class DeliverJob extends Job {
  public static assign(creep: Creep) {
    creep.memory.currentJob = JobTypes.Deliver;
    creep.memory.jobMemory = this.createMemory(creep);
  }

  public static checkComplete(creep: Creep): boolean {
    return creep.store.getUsedCapacity() === 0 || creep.room.energyAvailable === creep.room.energyCapacityAvailable;
  }

  private static decodeMemory(memory: any): StructureSpawn | StructureExtension | StructureTower | StructureStorage | StructureContainer | Structure | null {
    if ("targetId" in memory) {
      return Game.getObjectById(memory.targetId) as StructureSpawn | StructureExtension | StructureTower | StructureStorage | StructureContainer | Structure;
    } else return null;
  }

  public static run(creep: Creep) {
    if (this.checkComplete(creep)) JobUtility.AssignRequiredJob(creep);
    let target = this.decodeMemory(creep.memory.jobMemory);
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

  public static saveMemory(creep: Creep) {
    return { targetId: this.decodeMemory(creep.memory.jobMemory) };
  }
}
