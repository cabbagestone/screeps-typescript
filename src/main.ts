import { CreepJobStatus, CreepRole } from "enums";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */

  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: CreepRole;
    jobStatus: CreepJobStatus;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  let minimumDesiredCreeps = 10;
  let home = Game.spawns["Spawn1"].room;
  let totalEnergy = home.energyAvailable;
  let costForCreep = 200;
  let creepSetup = [WORK, CARRY, MOVE];

  // Creep Action Loop
  let creepCount = 0;
  for (let creepName in Game.creeps) {
    let creep = Game.creeps[creepName];
    creepCount++;

    // on demand memory cleaning
    if (creep.ticksToLive === 1) {
      creep.suicide();
      console.log("killed" + creepName);
      delete Memory.creeps[creepName];
    }

    if (creep.memory.role === CreepRole.Worker) {
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
  }

  // Spawn Action Loop
  for (let spawnName in Game.spawns) {
    let spawn = Game.spawns[spawnName];
    if (creepCount < minimumDesiredCreeps && totalEnergy >= costForCreep) {
      spawn.spawnCreep(creepSetup, "Worker" + Game.time, {
        memory: { role: CreepRole.Worker, jobStatus: CreepJobStatus.Idle }
      });
    }
  }


});

class RoomMeta {
  private creepCount = 0;
  public constructor(private name: string) { }
  public incrementCreepCount() { this.creepCount++ }
  public getName() { return this.name }
}
