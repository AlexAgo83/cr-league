export class LeagueRuleError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 409) {
    super(message);
    this.name = "LeagueRuleError";
    this.statusCode = statusCode;
  }
}
