persistent actor City {
  public query func greet() : async Text {
    return "Hello from City!";
  };
};