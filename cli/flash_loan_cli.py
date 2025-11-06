#!/usr/bin/env python3
"""
Coreum Flash Loan CLI
A command-line interface for interacting with the CosmWasm flash loan contracts on Coreum network.
"""

import os
import json
import sys
from pathlib import Path
from typing import Optional, Dict, Any
import click
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich import print as rprint

# Load environment variables
load_dotenv()

console = Console()


class CoreumFlashLoanCLI:
    """Main CLI class for Coreum Flash Loan operations"""

    def __init__(self, network: str = "testnet"):
        self.network = network
        self.config = self._load_config()
        self.network_config = self.config["networks"].get(network)

        if not self.network_config:
            raise ValueError(f"Network '{network}' not found in configuration")

        self.chain_id = self.network_config["chain_id"]
        self.rpc_endpoint = self.network_config["rpc_endpoint"]
        self.rest_endpoint = self.network_config["rest_endpoint"]
        self.denom = self.network_config["denom"]
        self.prefix = self.network_config["prefix"]

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from coreum-config.json"""
        config_path = Path(__file__).parent.parent / "coreum-config.json"
        with open(config_path, 'r') as f:
            return json.load(f)

    def get_contract_address(self, contract_name: str) -> Optional[str]:
        """Get contract address from environment"""
        env_var = f"{contract_name.upper()}_CONTRACT_ADDRESS"
        return os.getenv(env_var)


@click.group()
@click.option('--network', '-n', default='testnet',
              type=click.Choice(['mainnet', 'testnet', 'devnet']),
              help='Coreum network to use')
@click.pass_context
def cli(ctx, network):
    """Coreum Flash Loan CLI - Interact with flash loan contracts on Coreum"""
    ctx.ensure_object(dict)
    ctx.obj['cli'] = CoreumFlashLoanCLI(network)
    ctx.obj['network'] = network


@cli.group()
def deploy():
    """Deploy contracts to Coreum network"""
    pass


@deploy.command('all')
@click.pass_context
def deploy_all(ctx):
    """Deploy all contracts"""
    console.print("[bold green]Deploying all contracts...[/bold green]")
    console.print("This will deploy:")
    console.print("  1. Flash Loan Contract")
    console.print("  2. Simple Loan Receiver")
    console.print("  3. IBC Loan Receiver")
    console.print("\nPlease use the deployment script: ./scripts/deploy.sh")


@deploy.command('flash-loan')
@click.option('--admin', help='Admin address for the contract')
@click.option('--fee', default='0.003', help='Fee percentage (default: 0.003)')
@click.option('--denom', help='Loan denomination (e.g., ucore, or cw20 address)')
@click.pass_context
def deploy_flash_loan(ctx, admin, fee, denom):
    """Deploy the flash loan contract"""
    cli_obj = ctx.obj['cli']
    console.print(f"[bold green]Deploying Flash Loan Contract to {cli_obj.network}[/bold green]")
    console.print(f"Chain ID: {cli_obj.chain_id}")
    console.print(f"Admin: {admin or 'None'}")
    console.print(f"Fee: {fee}")
    console.print(f"Denom: {denom or cli_obj.denom}")
    console.print("\n[yellow]Use the deployment script for actual deployment[/yellow]")


@cli.group()
def contract():
    """Interact with deployed contracts"""
    pass


@contract.command('info')
@click.argument('contract', type=click.Choice(['flash-loan', 'simple-receiver', 'ibc-receiver']))
@click.pass_context
def contract_info(ctx, contract):
    """Get contract information"""
    cli_obj = ctx.obj['cli']

    table = Table(title=f"{contract.upper()} Contract Info")
    table.add_column("Property", style="cyan")
    table.add_column("Value", style="green")

    contract_key = contract.replace('-', '_')
    address = cli_obj.get_contract_address(contract_key)

    table.add_row("Network", cli_obj.network)
    table.add_row("Chain ID", cli_obj.chain_id)
    table.add_row("Contract Address", address or "Not deployed")
    table.add_row("RPC Endpoint", cli_obj.rpc_endpoint)

    console.print(table)


@contract.command('query-config')
@click.pass_context
def query_config(ctx):
    """Query flash loan contract configuration"""
    cli_obj = ctx.obj['cli']
    address = cli_obj.get_contract_address('flash_loan')

    if not address:
        console.print("[red]Flash loan contract not deployed. Set FLASH_LOAN_CONTRACT_ADDRESS[/red]")
        return

    console.print(f"[bold]Querying config for contract: {address}[/bold]")
    console.print("\n[yellow]Query: {'get_config': {}}[/yellow]")
    console.print("\nUse cosmpy or cored to execute the actual query.")


@contract.command('query-balance')
@click.pass_context
def query_balance(ctx):
    """Query flash loan contract balance"""
    cli_obj = ctx.obj['cli']
    address = cli_obj.get_contract_address('flash_loan')

    if not address:
        console.print("[red]Flash loan contract not deployed[/red]")
        return

    console.print(f"[bold]Querying balance for contract: {address}[/bold]")
    console.print("\n[yellow]Query: {'balance': {}}[/yellow]")


@contract.command('query-provided')
@click.argument('address')
@click.pass_context
def query_provided(ctx, address):
    """Query provided amount for an address"""
    cli_obj = ctx.obj['cli']
    contract_addr = cli_obj.get_contract_address('flash_loan')

    if not contract_addr:
        console.print("[red]Flash loan contract not deployed[/red]")
        return

    console.print(f"[bold]Querying provided amount for: {address}[/bold]")
    query = {"provided": {"address": address}}
    console.print(f"\n[yellow]Query: {json.dumps(query, indent=2)}[/yellow]")


@contract.command('provide')
@click.argument('amount', type=int)
@click.pass_context
def provide_liquidity(ctx, amount):
    """Provide liquidity to the flash loan contract"""
    cli_obj = ctx.obj['cli']
    address = cli_obj.get_contract_address('flash_loan')

    if not address:
        console.print("[red]Flash loan contract not deployed[/red]")
        return

    console.print(f"[bold green]Providing {amount}{cli_obj.denom} to flash loan contract[/bold green]")

    msg = {"provide": {}}
    console.print(f"\nExecute Message: {json.dumps(msg, indent=2)}")
    console.print(f"Funds: {amount}{cli_obj.denom}")
    console.print(f"\n[yellow]Use: cored tx wasm execute {address} '{json.dumps(msg)}' --amount {amount}{cli_obj.denom}[/yellow]")


@contract.command('withdraw')
@click.pass_context
def withdraw_liquidity(ctx):
    """Withdraw liquidity from the flash loan contract"""
    cli_obj = ctx.obj['cli']
    address = cli_obj.get_contract_address('flash_loan')

    if not address:
        console.print("[red]Flash loan contract not deployed[/red]")
        return

    console.print("[bold green]Withdrawing from flash loan contract[/bold green]")

    msg = {"withdraw": {}}
    console.print(f"\nExecute Message: {json.dumps(msg, indent=2)}")
    console.print(f"\n[yellow]Use: cored tx wasm execute {address} '{json.dumps(msg)}'[/yellow]")


@contract.command('loan')
@click.argument('receiver')
@click.argument('amount', type=int)
@click.pass_context
def request_loan(ctx, receiver, amount):
    """Request a flash loan"""
    cli_obj = ctx.obj['cli']
    address = cli_obj.get_contract_address('flash_loan')

    if not address:
        console.print("[red]Flash loan contract not deployed[/red]")
        return

    console.print(f"[bold green]Requesting loan of {amount}{cli_obj.denom}[/bold green]")
    console.print(f"Receiver: {receiver}")

    msg = {
        "loan": {
            "receiver": receiver,
            "amount": str(amount)
        }
    }
    console.print(f"\nExecute Message: {json.dumps(msg, indent=2)}")
    console.print(f"\n[yellow]Use: cored tx wasm execute {address} '{json.dumps(msg)}'[/yellow]")


@cli.command()
@click.pass_context
def config(ctx):
    """Show current configuration"""
    cli_obj = ctx.obj['cli']

    table = Table(title="Coreum Flash Loan Configuration")
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="green")

    table.add_row("Network", cli_obj.network)
    table.add_row("Chain ID", cli_obj.chain_id)
    table.add_row("RPC Endpoint", cli_obj.rpc_endpoint)
    table.add_row("REST Endpoint", cli_obj.rest_endpoint)
    table.add_row("Native Denom", cli_obj.denom)
    table.add_row("Address Prefix", cli_obj.prefix)

    console.print(table)

    console.print("\n[bold]Contract Addresses:[/bold]")
    contracts = {
        'Flash Loan': cli_obj.get_contract_address('flash_loan'),
        'Simple Receiver': cli_obj.get_contract_address('simple_receiver'),
        'IBC Receiver': cli_obj.get_contract_address('ibc_receiver'),
    }

    for name, addr in contracts.items():
        status = "[green]✓[/green]" if addr else "[red]✗[/red]"
        console.print(f"  {status} {name}: {addr or 'Not deployed'}")


@cli.command()
def networks():
    """List available networks"""
    config_path = Path(__file__).parent.parent / "coreum-config.json"
    with open(config_path, 'r') as f:
        config = json.load(f)

    table = Table(title="Available Coreum Networks")
    table.add_column("Network", style="cyan")
    table.add_column("Chain ID", style="green")
    table.add_column("RPC Endpoint", style="yellow")

    for network, details in config["networks"].items():
        table.add_row(network, details["chain_id"], details["rpc_endpoint"])

    console.print(table)


if __name__ == '__main__':
    cli(obj={})
