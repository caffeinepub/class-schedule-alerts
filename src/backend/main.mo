import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type ScheduleClass = {
    id : Nat;
    name : Text;
    dayOfWeek : Nat;
    startTime : Text;
    endTime : Text;
    location : ?Text;
    notes : ?Text;
    alertMinutesBefore : Nat;
  };

  let classes = Map.empty<Nat, ScheduleClass>();

  var nextId = 0;

  public shared ({ caller }) func addScheduleClass(
    name : Text,
    dayOfWeek : Nat,
    startTime : Text,
    endTime : Text,
    location : ?Text,
    notes : ?Text,
    alertMinutesBefore : Nat,
  ) : async ScheduleClass {
    let newClass : ScheduleClass = {
      id = nextId;
      name;
      dayOfWeek;
      startTime;
      endTime;
      location;
      notes;
      alertMinutesBefore;
    };

    classes.add(nextId, newClass);
    nextId += 1;
    newClass;
  };

  public shared ({ caller }) func updateScheduleClass(
    id : Nat,
    name : Text,
    dayOfWeek : Nat,
    startTime : Text,
    endTime : Text,
    location : ?Text,
    notes : ?Text,
    alertMinutesBefore : Nat,
  ) : async () {
    switch (classes.get(id)) {
      case (null) {
        Runtime.trap("Class with id " # id.toText() # " does not exist");
      };
      case (?_) {
        let updatedClass : ScheduleClass = {
          id;
          name;
          dayOfWeek;
          startTime;
          endTime;
          location;
          notes;
          alertMinutesBefore;
        };
        classes.add(id, updatedClass);
      };
    };
  };

  public shared ({ caller }) func deleteScheduleClass(id : Nat) : async () {
    if (not classes.containsKey(id)) {
      Runtime.trap("Class with id " # id.toText() # " does not exist");
    };
    classes.remove(id);
  };

  public query ({ caller }) func getScheduleClasses() : async [ScheduleClass] {
    classes.values().toArray();
  };
};
