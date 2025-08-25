<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class UpdateRoleStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'roles:update-structure';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update roles structure to include hpci_admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating role structure...');

        // Check if hpci_admin role exists, create if not
        $hpci_admin_role = Role::where('name', '')->first();
        if (! $hpci_admin_role) {
            $hpci_admin_role = Role::create(['name' => 'hpci_admin']);
            $this->info('Created hpci_admin role');
        }

        // Get all users with admin role and assign hpci_admin role
        $adminUsers = User::role('admin')->get();
        $count = 0;

        foreach ($adminUsers as $user) {
            if (! $user->hasRole('hpci_admin')) {
                $user->assignRole('hpci_admin');
                $count++;
            }
        }

        $this->info("Updated $count users with hpci_admin role");
        $this->info('Role structure update complete');

        return Command::SUCCESS;
    }
}
