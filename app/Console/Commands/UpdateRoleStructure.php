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
    protected $description = 'Update roles structure to include caravea_admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating role structure...');

        // Check if caravea_admin role exists, create if not
        $caravea_admin_role = Role::where('name', 'caravea_admin')->first();
        if (! $caravea_admin_role) {
            $caravea_admin_role = Role::create(['name' => 'caravea_admin']);
            $this->info('Created caravea_admin role');
        }

        // Get all users with admin role and assign caravea_admin role
        $adminUsers = User::role('admin')->get();
        $count      = 0;

        foreach ($adminUsers as $user) {
            if (! $user->hasRole('caravea_admin')) {
                $user->assignRole('caravea_admin');
                $count++;
            }
        }

        $this->info("Updated $count users with caravea_admin role");
        $this->info('Role structure update complete');

        return Command::SUCCESS;
    }
}
