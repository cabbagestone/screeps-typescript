export class CreepFunctions {
  public static memorySafeSuicideCheck(creep: Creep) {
    if (creep.ticksToLive === 1) {
      let name = creep.name;
      creep.suicide();
      delete Memory.creeps[name];
    }
  }
}
