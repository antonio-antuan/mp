const Migrations = artifacts.require("Migrations");

module.exports = async () => {
  const migrs = await Migrations.new();
  Migrations.setAsDeployed(migrs);
};