<?php

namespace Database\Seeders;

use App\Models\AdvertisingPlatform;
use App\Models\EmployeeStatus;
use App\Models\ExpenseCategory;
use App\Models\PaymentStatus;
use App\Models\PaymentType;
use App\Models\Priority;
use App\Models\TaskStatus;
use Illuminate\Database\Seeder;

class LookupTableSeeder extends Seeder
{
    public function run(): void
    {
        $employeeStatuses = [
            ['name' => 'Active', 'code' => 'active', 'color' => '#22c55e', 'sort_order' => 1],
            ['name' => 'On Leave', 'code' => 'on_leave', 'color' => '#f59e0b', 'sort_order' => 2],
            ['name' => 'Terminated', 'code' => 'terminated', 'color' => '#ef4444', 'sort_order' => 3],
            ['name' => 'Probation', 'code' => 'probation', 'color' => '#3b82f6', 'sort_order' => 4],
        ];

        foreach ($employeeStatuses as $status) {
            EmployeeStatus::firstOrCreate(['code' => $status['code']], $status);
        }

        $taskStatuses = [
            ['name' => 'Not Started', 'code' => 'todo', 'color' => '#94a3b8', 'sort_order' => 1, 'is_default' => true, 'is_closed' => false],
            ['name' => 'In Progress', 'code' => 'in_progress', 'color' => '#3b82f6', 'sort_order' => 2, 'is_default' => false, 'is_closed' => false],
            ['name' => 'Under Review', 'code' => 'review', 'color' => '#f59e0b', 'sort_order' => 3, 'is_default' => false, 'is_closed' => false],
            ['name' => 'Completed', 'code' => 'done', 'color' => '#22c55e', 'sort_order' => 4, 'is_default' => false, 'is_closed' => true],
            ['name' => 'Cancelled', 'code' => 'cancelled', 'color' => '#ef4444', 'sort_order' => 5, 'is_default' => false, 'is_closed' => true],
        ];

        foreach ($taskStatuses as $status) {
            TaskStatus::updateOrCreate(['code' => $status['code']], $status);
        }

        $priorities = [
            ['name' => 'Low', 'code' => 'low', 'level' => 1, 'color' => '#94a3b8'],
            ['name' => 'Medium', 'code' => 'medium', 'level' => 2, 'color' => '#3b82f6'],
            ['name' => 'High', 'code' => 'high', 'level' => 3, 'color' => '#f59e0b'],
            ['name' => 'Critical', 'code' => 'critical', 'level' => 4, 'color' => '#ef4444'],
        ];

        foreach ($priorities as $priority) {
            Priority::firstOrCreate(['code' => $priority['code']], $priority);
        }

        $paymentTypes = [
            ['name' => 'Salary', 'code' => 'salary', 'description' => 'Regular salary payment'],
            ['name' => 'Bonus', 'code' => 'bonus', 'description' => 'Performance or seasonal bonus'],
            ['name' => 'Commission', 'code' => 'commission', 'description' => 'Sales commission'],
            ['name' => 'Reimbursement', 'code' => 'reimbursement', 'description' => 'Expense reimbursement'],
        ];

        foreach ($paymentTypes as $type) {
            PaymentType::firstOrCreate(['code' => $type['code']], $type);
        }

        $paymentStatuses = [
            ['name' => 'Pending', 'code' => 'pending', 'color' => '#f59e0b', 'is_final' => false],
            ['name' => 'Processing', 'code' => 'processing', 'color' => '#3b82f6', 'is_final' => false],
            ['name' => 'Completed', 'code' => 'completed', 'color' => '#22c55e', 'is_final' => true],
            ['name' => 'Failed', 'code' => 'failed', 'color' => '#ef4444', 'is_final' => true],
            ['name' => 'Cancelled', 'code' => 'cancelled', 'color' => '#94a3b8', 'is_final' => true],
        ];

        foreach ($paymentStatuses as $status) {
            PaymentStatus::firstOrCreate(['code' => $status['code']], $status);
        }

        $expenseCategories = [
            ['name' => 'Office Supplies', 'code' => 'office_supplies'],
            ['name' => 'Travel', 'code' => 'travel'],
            ['name' => 'Advertising', 'code' => 'advertising'],
            ['name' => 'Software', 'code' => 'software'],
            ['name' => 'Utilities', 'code' => 'utilities'],
            ['name' => 'Meals & Entertainment', 'code' => 'meals'],
        ];

        foreach ($expenseCategories as $category) {
            ExpenseCategory::firstOrCreate(['code' => $category['code']], $category);
        }

        $platforms = [
            ['name' => 'Google Ads', 'code' => 'google_ads', 'website' => 'https://ads.google.com'],
            ['name' => 'Facebook Ads', 'code' => 'facebook_ads', 'website' => 'https://facebook.com/business'],
            ['name' => 'LinkedIn Ads', 'code' => 'linkedin_ads', 'website' => 'https://linkedin.com/ads'],
            ['name' => 'Instagram Ads', 'code' => 'instagram_ads', 'website' => 'https://instagram.com'],
            ['name' => 'Twitter/X Ads', 'code' => 'twitter_ads', 'website' => 'https://x.com'],
        ];

        foreach ($platforms as $platform) {
            AdvertisingPlatform::firstOrCreate(['code' => $platform['code']], $platform);
        }
    }
}
