#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Байгууллагын бүтцийг тохируулах скрипт
Одоо дээр ажиллагаа удирдлагын сувгийг бүрэн тохируулна
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


class OrganizationalSetup:
    """Байгууллагын бүтцийн тохиргоо"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    async def setup_organizational_structure(self):
        """
        Байгууллагын бүтцийн анхны тохиргоо хийх функц
        """
        print("=" * 80)
        print("БАЙГУУЛЛАГЫН БҮТЦИЙН ТОХИРГОО")
        print("=" * 80)
        
        try:
            # 1. ИЕРАРХИЙН ТҮВШИНҮҮДИЙГ ТОХИРУУЛАХ
            await self._setup_hierarchy_levels()
            
            # 2. ҮҮРЭГҮҮДИЙГ ТОХИРУУЛАХ
            await self._setup_roles()
            
            # 3. АЛБААДЫГ ТОХИРУУЛАХ
            await self._setup_departments()
            
            # 4. ХЭРЭГЛЭГЧДИЙГ ТОХИРУУЛАХ
            await self._setup_users()
            
            # 5. УДИРДЛАГЫН СУВГИЙГ ТОХИРУУЛАХ
            await self._setup_reporting_structure()
            
            # 6. БАГУУДЫГ ТОХИРУУЛАХ
            await self._setup_teams()
            
            # 7. МЕНЕЖМЕНТ ТОХИРГООГ ХИЙХ
            await self._setup_management_assignments()
            
            print("\n✓ БҮТЦИЙН ТОХИРГОО АМЖИЛТТАЙ ДҮҮРГҮҮЛЭГДЛЭЭ")
            print("=" * 80)
            
        except Exception as e:
            print(f"\n❌ АЛДАА: {str(e)}")
            raise

    async def _setup_hierarchy_levels(self):
        """Иерархийн түвшинүүдийг тохируулах"""
        print("\n1. ИЕРАРХИЙН ТҮВШИНҮҮДИГ ТОХИРУУЛЖ БУЙ...")
        
        levels = [
            (1, 'Executive Director', 'Top-level strategic leadership'),
            (2, 'Director', 'Senior strategic leadership'),
            (3, 'Manager', 'Middle management - coordinates all departments'),
            (4, 'Department Head', 'Leads and manages individual department'),
            (5, 'Team Leader', 'Leads teams within a department'),
            (6, 'Employee', 'Individual contributor')
        ]
        
        for level_number, title, description in levels:
            try:
                result = self.supabase.table('hierarchy_levels').upsert({
                    'level_number': level_number,
                    'title': title,
                    'description': description
                }, on_conflict='level_number').execute()
                print(f"   ✓ {title} түвшин тохируулагдлаа")
            except Exception as e:
                print(f"   ⚠ {title} түвшин тохируулахад алдаа гарлаа: {e}")

    async def _setup_roles(self):
        """Үүрэгүүдийг тохируулах"""
        print("\n2. ҮҮРЭГҮҮДИЙГ ТОХИРУУЛЖ БУЙ...")
        
        roles = [
            ('admin', 'System administrator'),
            ('director', 'Executive director overseeing organization'),
            ('manager', 'Central manager coordinating departments'),
            ('department_head', 'Head of department'),
            ('team_leader', 'Leader of team within department'),
            ('employee', 'Individual contributor')
        ]
        
        for name, description in roles:
            try:
                result = self.supabase.table('roles').upsert({
                    'name': name,
                    'description': description
                }, on_conflict='name').execute()
                print(f"   ✓ {name} үүрэг тохируулагдлаа")
            except Exception as e:
                print(f"   ⚠ {name} үүрэг тохируулахад алдаа гарлаа: {e}")

    async def _setup_departments(self):
        """Албаа тохируулах"""
        print("\n3. АЛБААДЫГ ТОХИРУУЛЖ БУЙ...")
        
        departments = [
            ('Finance Department', 'DEPT_FIN', 'Financial management and accounting'),
            ('Human Resources Department', 'DEPT_HR', 'Human resources and personnel'),
            ('Operations Department', 'DEPT_OPS', 'Business operations and logistics'),
            ('Sales Department', 'DEPT_SALES', 'Sales and business development'),
            ('Marketing Department', 'DEPT_MKT', 'Marketing and communications'),
            ('Technology Department', 'DEPT_TECH', 'Information technology and systems')
        ]
        
        for name, code, description in departments:
            try:
                result = self.supabase.table('departments').upsert({
                    'name': name,
                    'code': code,
                    'description': description,
                    'level': 1,
                    'is_active': True
                }, on_conflict='code').execute()
                print(f"   ✓ {name} алба тохируулагдлаа")
            except Exception as e:
                print(f"   ⚠ {name} алба тохируулахад алдаа гарлаа: {e}")

    async def _setup_users(self):
        """Хэрэглэгчдийг тохируулах"""
        print("\n4. ХЭРЭГЛЭГЧДИЙГ ТОХИРУУЛЖ БУЙ...")
        
        # Get role IDs
        roles_result = self.supabase.table('roles').select('*').execute()
        roles_dict = {role['name']: role['id'] for role in roles_result.data}
        
        # Get department IDs
        departments_result = self.supabase.table('departments').select('*').execute()
        departments_dict = {dept['code']: dept['id'] for dept in departments_result.data}
        
        users = [
            # Directors
            ('Bataar Director 1', 'bataar.director1@company.com', 'director', None, None),
            ('Temüjin Director 2', 'temujin.director2@company.com', 'director', None, 'bataar.director1@company.com'),
            
            # Manager
            ('Khenbish Manager', 'khenbish.manager@company.com', 'manager', None, 'bataar.director1@company.com'),
            
            # Department Heads
            ('Enkh Finance Head', 'enkh.fin@company.com', 'department_head', 'DEPT_FIN', 'khenbish.manager@company.com'),
            ('Enkh HR Head', 'enkh.hr@company.com', 'department_head', 'DEPT_HR', 'khenbish.manager@company.com'),
            ('Enkh Operations Head', 'enkh.ops@company.com', 'department_head', 'DEPT_OPS', 'khenbish.manager@company.com'),
            ('Enkh Sales Head', 'enkh.sales@company.com', 'department_head', 'DEPT_SALES', 'khenbish.manager@company.com'),
            ('Enkh Marketing Head', 'enkh.mkt@company.com', 'department_head', 'DEPT_MKT', 'khenbish.manager@company.com'),
            ('Enkh Technology Head', 'enkh.tech@company.com', 'department_head', 'DEPT_TECH', 'khenbish.manager@company.com'),
            
            # Team Leaders
            ('Oyu Finance Leader', 'oyu.leader1@company.com', 'team_leader', 'DEPT_FIN', 'enkh.fin@company.com'),
            ('Sarnai HR Leader', 'sarnai.leader2@company.com', 'team_leader', 'DEPT_HR', 'enkh.hr@company.com'),
            ('Tuvshin Operations Leader', 'tuvshin.leader3@company.com', 'team_leader', 'DEPT_OPS', 'enkh.ops@company.com'),
            ('Nara Sales Leader', 'nara.leader4@company.com', 'team_leader', 'DEPT_SALES', 'enkh.sales@company.com'),
            ('Bold Marketing Leader', 'bold.leader5@company.com', 'team_leader', 'DEPT_MKT', 'enkh.mkt@company.com'),
            ('Ganzorig Technology Leader', 'ganzorig.leader6@company.com', 'team_leader', 'DEPT_TECH', 'enkh.tech@company.com')
        ]
        
        manager_ids = {}
        
        # First pass: create users without manager relationships
        for name, email, position, dept_code, manager_email in users:
            try:
                user_data = {
                    'name': name,
                    'email': email,
                    'position': position,
                    'status': 'active',
                    'is_active': True
                }
                
                if position in roles_dict:
                    user_data['role_id'] = roles_dict[position]
                
                if dept_code and dept_code in departments_dict:
                    user_data['department_id'] = departments_dict[dept_code]
                
                result = self.supabase.table('users').upsert(
                    user_data, 
                    on_conflict='email',
                    returning='id'
                ).execute()
                
                if result.data:
                    manager_ids[email] = result.data[0]['id']
                    print(f"   ✓ {name} хэрэглэгч тохируулагдлаа")
                
            except Exception as e:
                print(f"   ⚠ {name} хэрэглэгч тохируулахад алдаа гарлаа: {e}")
        
        # Second pass: update manager relationships
        for name, email, position, dept_code, manager_email in users:
            if manager_email and manager_email in manager_ids and email in manager_ids:
                try:
                    self.supabase.table('users').update({
                        'manager_id': manager_ids[manager_email]
                    }).eq('email', email).execute()
                    print(f"   ✓ {name} -> {manager_email} удирдлагын холбоо тогтоогдлоо")
                except Exception as e:
                    print(f"   ⚠ {name} удирдлагын холбоо тогтооход алдаа гарлаа: {e}")

    async def _setup_teams(self):
        """Багуудыг тохируулах"""
        print("\n5. БАГУУДЫГ ТОХИРУУЛЖ БУЙ...")
        
        # Get departments
        departments_result = self.supabase.table('departments').select('*').execute()
        
        for dept in departments_result.data:
            if dept['code'].startswith('DEPT_'):
                team_code = dept['code'].replace('DEPT_', 'TEAM_')
                team_name = dept['name'].replace('Department', 'Team')
                
                try:
                    result = self.supabase.table('teams').upsert({
                        'team_code': team_code,
                        'name': team_name,
                        'department_id': dept['id'],
                        'description': f'Primary operational team for {dept["name"]}',
                        'status': 'active'
                    }, on_conflict='team_code').execute()
                    print(f"   ✓ {team_name} баг тохируулагдлаа")
                except Exception as e:
                    print(f"   ⚠ {team_name} баг тохируулахад алдаа гарлаа: {e}")

    async def _setup_management_assignments(self):
        """Менежментийн томилгоог тохируулах"""
        print("\n6. МЕНЕЖМЕНТ ТОХИРГООГ ХИЙЖ БУЙ...")
        
        # Get department heads and team leaders
        users_result = self.supabase.table('users').select('*').in_(
            'position', ['department_head', 'team_leader']
        ).execute()
        
        for user in users_result.data:
            try:
                assignment_data = {
                    'user_id': user['id'],
                    'assignment_type': user['position'],
                    'assignment_date': datetime.now().date().isoformat(),
                    'is_primary': True
                }
                
                if user['department_id']:
                    assignment_data['department_id'] = user['department_id']
                
                result = self.supabase.table('management_assignments').upsert(
                    assignment_data,
                    on_conflict='user_id,department_id,assignment_type'
                ).execute()
                print(f"   ✓ {user['name']} менежмент томилгоо тохируулагдлаа")
                
            except Exception as e:
                print(f"   ⚠ {user['name']} менежмент томилгоо хийхэд алдаа гарлаа: {e}")

    async def _setup_reporting_structure(self):
        """Удирдлагын сувгийг тохируулах"""
        print("\n7. УДИРДЛАГЫН СУВГИЙГ ТОХИРУУЛЖ БУЙ...")
        
        # Get hierarchy levels
        levels_result = self.supabase.table('hierarchy_levels').select('*').execute()
        levels_dict = {level['level_number']: level['id'] for level in levels_result.data}
        
        # Get users with managers
        users_result = self.supabase.table('users').select('*').not_(
            'manager_id', 'is', None
        ).execute()
        
        for user in users_result.data:
            try:
                # Determine hierarchy level based on position
                position_level_map = {
                    'director': 2,
                    'manager': 3,
                    'department_head': 4,
                    'team_leader': 5,
                    'employee': 6
                }
                
                level_number = position_level_map.get(user['position'], 6)
                
                if level_number in levels_dict:
                    # Add to reporting chains
                    self.supabase.table('reporting_chains').upsert({
                        'user_id': user['id'],
                        'direct_manager_id': user['manager_id'],
                        'hierarchy_level_id': levels_dict[level_number],
                        'effective_date': datetime.now().date().isoformat(),
                        'is_current': True
                    }, on_conflict='user_id,direct_manager_id,hierarchy_level_id,effective_date').execute()
                    
                    # Add to organizational structure
                    self.supabase.table('organizational_structure').upsert({
                        'user_id': user['id'],
                        'department_id': user['department_id'],
                        'position_level': level_number,
                        'reporting_to_user_id': user['manager_id'],
                        'effective_date': datetime.now().date().isoformat(),
                        'is_active': True
                    }, on_conflict='user_id,effective_date').execute()
                    
                    print(f"   ✓ {user['name']} удирдлагын бүтэцтэй холбогдлоо")
                
            except Exception as e:
                print(f"   ⚠ {user['name']} удирдлагын бүтцэд оруулахад алдаа гарлаа: {e}")


async def main():
    """Үндсэн функц"""
    # Environment variables-аас Supabase тохиргоог унших
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ NEXT_PUBLIC_SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY орчны хувьсагчид шаардлагатай")
        print("Эхлээд .env файлдаа эдгээр тохиргоог оруулна уу")
        sys.exit(1)
    
    setup = OrganizationalSetup(supabase_url, supabase_key)
    await setup.setup_organizational_structure()


if __name__ == '__main__':
    print("Байгууллагын бүтцийг тохируулах скрипт")
    print("Хэрэглээ: python scripts/setup_organizational_structure.py")
    print("\nЭнэ скрипт нь:")
    print("- Иерархийн түвшинүүдийг тохируулна")
    print("- Үүрэгүүдийг тохируулна")
    print("- Албаа болон багуудыг үүсгэнэ")
    print("- Хэрэглэгчдийг тохируулна")
    print("- Удирдлагын сувгийг бүрдүүлнэ")
    print("- Менежмент томилгоог хийнэ\n")
    
    asyncio.run(main())
