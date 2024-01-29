import { CreepJobStatus } from "enums";

export class CreepFunctions {
  public static workerRole(creep: Creep) {
    // destination 1 is source, destination 2 is home
    if (
      creep.memory.jobStatus === CreepJobStatus.FirstDestination
      && creep.store.getFreeCapacity() === 0
    ) {
      creep.memory.jobStatus = CreepJobStatus.SecondDestination;
    } else if (
      creep.memory.jobStatus === CreepJobStatus.SecondDestination
      && creep.store.getUsedCapacity() === 0
    ) {
      creep.memory.jobStatus = CreepJobStatus.FirstDestination;
    } else if (creep.memory.jobStatus === CreepJobStatus.Idle) {
      creep.memory.jobStatus = CreepJobStatus.FirstDestination;
    }

    if (creep.memory.jobStatus === CreepJobStatus.FirstDestination) {
      let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      }
    } else if (creep.memory.jobStatus === CreepJobStatus.SecondDestination) {
      let spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
      if (spawn) {
        if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(spawn);
        }
      }
    }
  }

  public static memorySafeSuicideCheck(creep: Creep) {
    if (creep.ticksToLive === 1) {
      let name = creep.name;
      creep.suicide();
      delete Memory.creeps[name];
    }
  }
}
