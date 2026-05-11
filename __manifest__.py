{
    'name': 'Байгууллагын Бүтэц Тохиргоо',
    'version': '17.0.1.0',
    'category': 'Human Resources',
    'author': 'Organization Administrator',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'hr',
        'hr_org_chart',
    ],
    'data': [
        'data/odoo_organizational_data.xml',
    ],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'application': False,
    'summary': 'Байгууллагын альбаа, дарга болон удирдлагын бүтцийг тохируулна',
    'description': '''
        Энэ модуль дараах үйл ажиллагаа хийнэ:
        
        1. АЖИЛТНЫ БАЙРЛАЛУУД (Job Positions)
           - Захирал (Director)
           - Төвийн Менежер (Central Manager)
           - Албаны Дарга (Department Head)
           - Багийн Удирдагч (Team Leader)
           - Ажилтан (Employee)
        
        2. АЛБУУД (Departments)
           - Санхүүгийн Хэлтэс (Finance)
           - Хүний Нөөцийн Хэлтэс (Human Resources)
           - Үйл ажиллагааны Хэлтэс (Operations)
           - Борлуулалтын Хэлтэс (Sales)
           - Маркетингийн Хэлтэс (Marketing)
           - Технологийн Хэлтэс (Technology)
        
        3. АЖИЛТНУУД (Employees)
           - 2 Захирал
           - 1 Төвийн Менежер
           - 6 Албаны Дарга
           - 6 Багийн Удирдагч
           - Нийт 15 ажилтан
        
        4. УДИРДЛАГЫН СУВАГ (Reporting Structure)
           Захирал 1 → Захирал 2
           Захирал 1 → Төвийн Менежер
           Төвийн Менежер → 6 Албаны Дарга
           Албаны Дарга → Багийн Удирдагч
    ''',
    'website': 'https://company.mn',
}
