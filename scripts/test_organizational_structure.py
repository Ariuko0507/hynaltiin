#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Байгууллагын бүтцийг тестлэх скрипт
Тохиргоо зө эсэхийг шалгах
"""

import sys
import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Supabase client not installed. Run: pip install supabase")
    sys.exit(1)


class OrganizationalTester:
    """Байгууллагын бүтцийг тестлэх"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    async def run_tests(self):
        """
        Бүх тестүүдийг ажиллуулах
        """
        print("=" * 80)
        print("БАЙГУУЛЛАГЫН БҮТЦИЙГ ТЕСТЛЭХ")
        print("=" * 80)
        
        try:
            # 1. Иерархийн түвшинүүдийг шалгах
            await self._test_hierarchy_levels()
            
            # 2. Үүрэгүүдийг шалгах
            await self._test_roles()
            
            # 3. Албаа шалгах
            await self._test_departments()
            
            # 4. Хэрэглэгчдийг шалгах
            await self._test_users()
            
            # 5. Удирдлагын сувгийг шалгах
            await self._test_reporting_structure()
            
            # 6. Бүтцийн дүр зургийг харуулах
            await self._show_organizational_chart()
            
            print("\n✓ ТЕСТЛЭЛТ АМЖИЛТТАЙ ДУУССАН")
            print("=" * 80)
            
        except Exception as e:
            print(f"\n❌ АЛДАА: {str(e)}")
            raise

    async def _test_hierarchy_levels(self):
        """Иерархийн түвшинүүдийг шалгах"""
        print("\n1. ИЕРАХИЙН ТҮВШИНҮҮДИЙГ ШАЛГАЖ БУЙ...")
        
        try:
            result = self.supabase.table('hierarchy_levels').select('*').order('level_number').execute()
            levels = result.data
            
            expected_levels = [1, 2, 3, 4, 5, 6]
            actual_levels = [level['level_number'] for level in levels]
            
            if actual_levels == expected_levels:
                print("   ✓ Иерархийн түвшинүүд зөв тохируулагдсан")
                for level in levels:
                    print(f"     - {level['level_number']}: {level['title']}")
            else:
                print(f"   ❌ Иерархийн түвшинүүд буруу байна. Хүлээж буй: {expected_levels}, Бодит: {actual_levels}")
                
        except Exception as e:
            print(f"   ❌ Иерархийн түвшинүүдийг шалгахад алдаа гарлаа: {e}")

    async def _test_roles(self):
        """Үүрэгүүдийг шалгах"""
        print("\n2. ҮҮРЭГҮҮДИЙГ ШАЛГАЖ БУЙ...")
        
        try:
            result = self.supabase.table('roles').select('*').execute()
            roles = result.data
            
            expected_roles = ['admin', 'director', 'manager', 'department_head', 'team_leader', 'employee']
            actual_roles = [role['name'] for role in roles]
            
            missing_roles = set(expected_roles) - set(actual_roles)
            extra_roles = set(actual_roles) - set(expected_roles)
            
            if not missing_roles and not extra_roles:
                print("   ✓ Бүх үүрэг зөв тохируулагдсан")
                for role in roles:
                    print(f"     - {role['name']}: {role['description']}")
            else:
                if missing_roles:
                    print(f"   ❌ Дутагдсан үүрэгүүд: {missing_roles}")
                if extra_roles:
                    print(f"   ⚠ Нэмэлт үүрэгүүд: {extra_roles}")
                
        except Exception as e:
            print(f"   ❌ Үүрэгүүдийг шалгахад алдаа гарлаа: {e}")

    async def _test_departments(self):
        """Албаа шалгах"""
        print("\n3. АЛБААДЫГ ШАЛГАЖ БУЙ...")
        
        try:
            result = self.supabase.table('departments').select('*').execute()
            departments = result.data
            
            expected_depts = ['DEPT_FIN', 'DEPT_HR', 'DEPT_OPS', 'DEPT_SALES', 'DEPT_MKT', 'DEPT_TECH']
            actual_depts = [dept['code'] for dept in departments]
            
            missing_depts = set(expected_depts) - set(actual_depts)
            
            if not missing_depts:
                print("   ✓ Бүх алба зөв тохируулагдсан")
                for dept in departments:
                    manager_info = "Менежертэй" if dept.get('manager_id') else "Менежергүй"
                    print(f"     - {dept['name']} ({dept['code']}) - {manager_info}")
            else:
                print(f"   ❌ Дутагдсан алба: {missing_depts}")
                
        except Exception as e:
            print(f"   ❌ Албаа шалгахад алдаа гарлаа: {e}")

    async def _test_users(self):
        """Хэрэглэгчдийг шалгах"""
        print("\n4. ХЭРЭГЛЭГЧДИЙГ ШАЛГАЖ БУЙ...")
        
        try:
            result = self.supabase.table('users').select('*').execute()
            users = result.data
            
            # Expected users by position
            expected_counts = {
                'director': 2,
                'manager': 1,
                'department_head': 6,
                'team_leader': 6
            }
            
            actual_counts = {}
            for user in users:
                position = user.get('position', 'unknown')
                actual_counts[position] = actual_counts.get(position, 0) + 1
            
            print("   ✓ Хэрэглэгчдийн тоо:")
            for position, expected_count in expected_counts.items():
                actual_count = actual_counts.get(position, 0)
                status = "✓" if actual_count == expected_count else "❌"
                print(f"     {status} {position}: {actual_count}/{expected_count}")
            
            # Check manager relationships
            users_with_manager = [u for u in users if u.get('manager_id')]
            print(f"   ✓ Удирдлагатай холбогдсон хэрэглэгчид: {len(users_with_manager)}")
            
            # Check department assignments
            users_with_dept = [u for u in users if u.get('department_id')]
            print(f"   ✓ Албатай холбогдсон хэрэглэгчид: {len(users_with_dept)}")
                
        except Exception as e:
            print(f"   ❌ Хэрэглэгчдийг шалгахад алдаа гарлаа: {e}")

    async def _test_reporting_structure(self):
        """Удирдлагын сувгийг шалгах"""
        print("\n5. УДИРДЛАГЫН СУВГИЙГ ШАЛГАЖ БУЙ...")
        
        try:
            # Check reporting chains
            chains_result = self.supabase.table('reporting_chains').select('*').execute()
            chains = chains_result.data
            
            print(f"   ✓ Удирдлагын сувгийн холбоосууд: {len(chains)}")
            
            # Check organizational structure
            org_result = self.supabase.table('organizational_structure').select('*').execute()
            org_structure = org_result.data
            
            print(f"   ✓ Байгууллагын бүтцийн бичлэгүүд: {len(org_structure)}")
            
            # Check management assignments
            mgmt_result = self.supabase.table('management_assignments').select('*').execute()
            mgmt_assignments = mgmt_result.data
            
            print(f"   ✓ Менежмент томилгооны бичлэгүүд: {len(mgmt_assignments)}")
            
            # Check teams
            teams_result = self.supabase.table('teams').select('*').execute()
            teams = teams_result.data
            
            print(f"   ✓ Багууд: {len(teams)}")
                
        except Exception as e:
            print(f"   ❌ Удирдлагын сувгийг шалгахад алдаа гарлаа: {e}")

    async def _show_organizational_chart(self):
        """Байгууллагын бүтцийн дүр зургийг харуулах"""
        print("\n6. БАЙГУУЛЛАГЫН БҮТЦИЙН ДҮР ЗУРАГ:")
        
        try:
            # Get all users with their relationships
            result = self.supabase.table('users').select('''
                id, name, email, position, status,
                department_id, manager_id,
                departments(name, code),
                manager:users!manager_id(name, position)
            ''').execute()
            
            users = result.data
            
            # Group by hierarchy level
            directors = [u for u in users if u['position'] == 'director']
            managers = [u for u in users if u['position'] == 'manager']
            dept_heads = [u for u in users if u['position'] == 'department_head']
            team_leaders = [u for u in users if u['position'] == 'team_leader']
            
            print("\n   ЗАХИРАЛУУД:")
            for director in directors:
                manager_name = director['manager']['name'] if director.get('manager') else 'None'
                print(f"     - {director['name']} ({director['email']})")
                print(f"       Manager: {manager_name}")
            
            print("\n   МЕНЕЖЕР:")
            for manager in managers:
                manager_name = manager['manager']['name'] if manager.get('manager') else 'None'
                dept_name = manager.get('departments', {}).get('name', 'None')
                print(f"     - {manager['name']} ({manager['email']})")
                print(f"       Manager: {manager_name}")
                print(f"       Department: {dept_name}")
            
            print("\n   АЛБАНЫ ДАРГАНУУД:")
            for dept_head in dept_heads:
                manager_name = dept_head['manager']['name'] if dept_head.get('manager') else 'None'
                dept_name = dept_head.get('departments', {}).get('name', 'None')
                print(f"     - {dept_head['name']} ({dept_head['email']})")
                print(f"       Manager: {manager_name}")
                print(f"       Department: {dept_name}")
            
            print("\n   БАГИЙН УДИРДАГЧИД:")
            for team_leader in team_leaders:
                manager_name = team_leader['manager']['name'] if team_leader.get('manager') else 'None'
                dept_name = team_leader.get('departments', {}).get('name', 'None')
                print(f"     - {team_leader['name']} ({team_leader['email']})")
                print(f"       Manager: {manager_name}")
                print(f"       Department: {dept_name}")
                
        except Exception as e:
            print(f"   ❌ Бүтцийн дүр зургийг харуулахад алдаа гарлаа: {e}")


async def main():
    """Үндсэн функц"""
    # Environment variables-аас Supabase тохиргоог унших
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ NEXT_PUBLIC_SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY орчны хувьсагчид шаардлагатай")
        print("Эхлээд .env файлдаа эдгээр тохиргоог оруулна уу")
        sys.exit(1)
    
    tester = OrganizationalTester(supabase_url, supabase_key)
    await tester.run_tests()


if __name__ == '__main__':
    print("Байгууллагын бүтцийг тестлэх скрипт")
    print("Хэрэглээ: python scripts/test_organizational_structure.py")
    print("\nЭнэ скрипт нь:")
    print("- Иерархийн түвшинүүдийг шалгана")
    print("- Үүрэгүүдийг шалгана")
    print("- Албаа болон багуудыг шалгана")
    print("- Хэрэглэгчдийн тоо болон холбоог шалгана")
    print("- Удирдлагын сувгийг шалгана")
    print("- Бүтцийн дүр зургийг харуулна\n")
    
    asyncio.run(main())
