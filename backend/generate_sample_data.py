"""
Sample Data Generator for EA Direct

Generates realistic sample data for demonstration purposes:
- Business Applications
- Architecture Decision Records (ADRs)
- Technical Debt
- Suppliers and Products
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from db_models import (
    BusinessApp, ADR, ADROption, TechDebt, Supplier, Product, User
)
import random

def clear_sample_data(db: Session):
    """Clear existing sample data (except users)"""
    print("Clearing existing data...")
    db.query(ADROption).delete()
    db.query(TechDebt).delete()
    db.query(ADR).delete()
    db.query(Product).delete()
    db.query(BusinessApp).delete()
    db.query(Supplier).delete()
    db.commit()
    print("✓ Existing data cleared")

def generate_suppliers(db: Session):
    """Generate sample suppliers"""
    print("Generating suppliers...")

    suppliers_data = [
        {
            "name": "Microsoft Corporation",
            "contact_name": "Sarah Johnson",
            "contact_email": "sarah.johnson@microsoft.com",
            "contact_phone": "+1-425-882-8080",
            "website": "https://www.microsoft.com",
            "description": "Global technology company providing cloud services, software, and enterprise solutions"
        },
        {
            "name": "Amazon Web Services",
            "contact_name": "David Chen",
            "contact_email": "david.chen@aws.com",
            "contact_phone": "+1-206-266-4064",
            "website": "https://aws.amazon.com",
            "description": "Leading cloud computing platform offering scalable infrastructure and services"
        },
        {
            "name": "Red Hat",
            "contact_name": "Maria Garcia",
            "contact_email": "maria.garcia@redhat.com",
            "contact_phone": "+1-919-754-3700",
            "website": "https://www.redhat.com",
            "description": "Enterprise open source solutions provider for hybrid cloud infrastructure"
        },
        {
            "name": "Oracle Corporation",
            "contact_name": "Robert Smith",
            "contact_email": "robert.smith@oracle.com",
            "contact_phone": "+1-650-506-7000",
            "website": "https://www.oracle.com",
            "description": "Database and enterprise software solutions for business operations"
        },
        {
            "name": "Atlassian",
            "contact_name": "Emma Williams",
            "contact_email": "emma.williams@atlassian.com",
            "contact_phone": "+61-2-9262-5188",
            "website": "https://www.atlassian.com",
            "description": "Collaboration and productivity software for development teams"
        }
    ]

    suppliers = []
    for data in suppliers_data:
        supplier = Supplier(**data)
        db.add(supplier)
        suppliers.append(supplier)

    db.commit()
    print(f"✓ Created {len(suppliers)} suppliers")
    return suppliers

def generate_products(db: Session, suppliers: list):
    """Generate sample products"""
    print("Generating products...")

    products_data = [
        # Microsoft products
        {"supplier_id": suppliers[0].id, "name": "Azure Cloud Platform", "version": "2024", "license_type": "subscription", "support_url": "https://azure.microsoft.com/support"},
        {"supplier_id": suppliers[0].id, "name": "Microsoft 365", "version": "E5", "license_type": "subscription", "support_url": "https://support.microsoft.com"},
        {"supplier_id": suppliers[0].id, "name": "SQL Server", "version": "2022", "license_type": "perpetual", "support_url": "https://support.microsoft.com/sql"},

        # AWS products
        {"supplier_id": suppliers[1].id, "name": "Amazon EC2", "version": "current", "license_type": "pay-as-you-go", "support_url": "https://aws.amazon.com/ec2/support"},
        {"supplier_id": suppliers[1].id, "name": "Amazon RDS", "version": "current", "license_type": "pay-as-you-go", "support_url": "https://aws.amazon.com/rds/support"},
        {"supplier_id": suppliers[1].id, "name": "Amazon S3", "version": "current", "license_type": "pay-as-you-go", "support_url": "https://aws.amazon.com/s3/support"},

        # Red Hat products
        {"supplier_id": suppliers[2].id, "name": "Red Hat Enterprise Linux", "version": "9.2", "license_type": "subscription", "support_url": "https://access.redhat.com"},
        {"supplier_id": suppliers[2].id, "name": "OpenShift Container Platform", "version": "4.13", "license_type": "subscription", "support_url": "https://access.redhat.com/openshift"},

        # Oracle products
        {"supplier_id": suppliers[3].id, "name": "Oracle Database", "version": "19c", "license_type": "perpetual", "support_url": "https://support.oracle.com"},
        {"supplier_id": suppliers[3].id, "name": "Oracle WebLogic Server", "version": "14.1.1", "license_type": "perpetual", "support_url": "https://support.oracle.com"},

        # Atlassian products
        {"supplier_id": suppliers[4].id, "name": "Jira Software", "version": "Cloud", "license_type": "subscription", "support_url": "https://support.atlassian.com/jira"},
        {"supplier_id": suppliers[4].id, "name": "Confluence", "version": "Cloud", "license_type": "subscription", "support_url": "https://support.atlassian.com/confluence"}
    ]

    products = []
    for data in products_data:
        product = Product(**data)
        db.add(product)
        products.append(product)

    db.commit()
    print(f"✓ Created {len(products)} products")
    return products

def generate_business_apps(db: Session, products: list):
    """Generate sample business applications"""
    print("Generating business applications...")

    apps_data = [
        {
            "name": "Customer Relationship Management System",
            "description": "Enterprise CRM platform for managing customer interactions and sales pipeline",
            "owner": "Sales Department",
            "status": "active",
            "hosting_type": "cloud",
            "development_type": "cots",
            "resilience_category": "tier-1",
            "business_criticality": "high",
            "product_id": products[1].id  # Microsoft 365
        },
        {
            "name": "Enterprise Resource Planning",
            "description": "Integrated ERP system for finance, HR, and supply chain management",
            "owner": "Finance Department",
            "status": "active",
            "hosting_type": "on-premise",
            "development_type": "cots",
            "resilience_category": "tier-1",
            "business_criticality": "critical",
            "product_id": products[9].id  # Oracle Database
        },
        {
            "name": "Employee Self-Service Portal",
            "description": "Web portal for employees to manage HR tasks, benefits, and time tracking",
            "owner": "Human Resources",
            "status": "active",
            "hosting_type": "cloud",
            "development_type": "custom",
            "resilience_category": "tier-2",
            "business_criticality": "medium",
            "product_id": products[0].id  # Azure
        },
        {
            "name": "Legacy Inventory System",
            "description": "Warehouse and inventory management system scheduled for modernization",
            "owner": "Operations",
            "status": "deprecated",
            "hosting_type": "on-premise",
            "development_type": "custom",
            "resilience_category": "tier-3",
            "business_criticality": "low"
        },
        {
            "name": "Mobile Sales App",
            "description": "iOS and Android application for field sales representatives",
            "owner": "Sales Department",
            "status": "planned",
            "hosting_type": "cloud",
            "development_type": "custom",
            "resilience_category": "tier-2",
            "business_criticality": "medium",
            "product_id": products[4].id  # Amazon EC2
        },
        {
            "name": "Document Management System",
            "description": "Enterprise document storage and collaboration platform",
            "owner": "IT Department",
            "status": "active",
            "hosting_type": "cloud",
            "development_type": "cots",
            "resilience_category": "tier-2",
            "business_criticality": "medium",
            "product_id": products[11].id  # Confluence
        }
    ]

    apps = []
    for data in apps_data:
        app = BusinessApp(**data)
        db.add(app)
        apps.append(app)

    db.commit()
    print(f"✓ Created {len(apps)} business applications")
    return apps

def generate_adrs(db: Session):
    """Generate sample Architecture Decision Records"""
    print("Generating ADRs...")

    adrs_data = [
        {
            "title": "Adopt Microservices Architecture",
            "status": "accepted",
            "context": "Current monolithic architecture is difficult to scale and deploy. Teams are blocked waiting for full application deployments.",
            "decision": "Migrate to microservices architecture using containerization and Kubernetes orchestration.",
            "consequences": "Improved scalability and deployment flexibility, but increased operational complexity.",
            "tags": "architecture,microservices,containers",
            "stakeholders": "CTO, Development Team, Operations Team",
            "decision_date": datetime.now() - timedelta(days=90)
        },
        {
            "title": "Choose Cloud Provider for Infrastructure",
            "status": "accepted",
            "context": "Need to select primary cloud provider for hosting new applications and migrating existing workloads.",
            "decision": "Adopt AWS as primary cloud provider with multi-region deployment strategy.",
            "consequences": "Access to comprehensive cloud services, vendor lock-in considerations, team training required.",
            "tags": "cloud,infrastructure,aws",
            "stakeholders": "CTO, Infrastructure Team, Finance",
            "decision_date": datetime.now() - timedelta(days=120)
        },
        {
            "title": "API Gateway Pattern Implementation",
            "status": "proposed",
            "context": "Need centralized API management for microservices with authentication, rate limiting, and monitoring.",
            "decision": "Implement API gateway using Kong or AWS API Gateway for unified API management.",
            "consequences": "Centralized control and monitoring, single point of failure risk, additional infrastructure component.",
            "tags": "api,gateway,security",
            "stakeholders": "Security Team, Development Team, Operations"
        },
        {
            "title": "Database Strategy for Microservices",
            "status": "accepted",
            "context": "Each microservice needs data persistence with independent scaling and deployment.",
            "decision": "Use database-per-service pattern with PostgreSQL as primary database.",
            "consequences": "Data isolation and service autonomy, distributed transaction challenges, increased database instances.",
            "tags": "database,microservices,postgresql",
            "stakeholders": "Database Team, Development Team",
            "decision_date": datetime.now() - timedelta(days=60)
        },
        {
            "title": "Implement OAuth 2.0 for Authentication",
            "status": "accepted",
            "context": "Need standardized authentication across all applications with SSO capabilities.",
            "decision": "Implement OAuth 2.0 with OpenID Connect for centralized authentication.",
            "consequences": "Improved security and user experience, implementation complexity, user migration required.",
            "tags": "security,authentication,oauth",
            "stakeholders": "Security Team, Development Team, IT Support",
            "decision_date": datetime.now() - timedelta(days=45)
        }
    ]

    adrs = []
    for data in adrs_data:
        adr = ADR(**data)
        db.add(adr)
        db.flush()  # Get the ID

        # Add decision options for some ADRs
        if "Cloud Provider" in data["title"]:
            options_data = [
                {
                    "adr_id": adr.id,
                    "name": "Amazon Web Services (AWS)",
                    "description": "Comprehensive cloud platform with global presence",
                    "pros": "Market leader, extensive services, strong ecosystem, proven scalability",
                    "cons": "Vendor lock-in, complex pricing, steep learning curve",
                    "cost_estimate": "Moderate to High",
                    "effort_estimate": "6-8 months migration"
                },
                {
                    "adr_id": adr.id,
                    "name": "Microsoft Azure",
                    "description": "Microsoft's enterprise cloud platform",
                    "pros": "Excellent Microsoft integration, hybrid cloud support, enterprise features",
                    "cons": "Smaller service catalog than AWS, regional availability",
                    "cost_estimate": "Moderate",
                    "effort_estimate": "5-7 months migration"
                },
                {
                    "adr_id": adr.id,
                    "name": "Google Cloud Platform",
                    "description": "Google's cloud infrastructure and services",
                    "pros": "Strong in AI/ML, competitive pricing, excellent networking",
                    "cons": "Smaller market share, fewer enterprise features",
                    "cost_estimate": "Low to Moderate",
                    "effort_estimate": "5-7 months migration"
                }
            ]

            for opt_data in options_data:
                option = ADROption(**opt_data)
                db.add(option)

            adr.recommended_option = "Amazon Web Services (AWS)"
            adr.strategic_selection = "Amazon Web Services (AWS)"

        adrs.append(adr)

    db.commit()
    print(f"✓ Created {len(adrs)} ADRs")
    return adrs

def generate_tech_debt(db: Session, adrs: list):
    """Generate sample technical debt items"""
    print("Generating technical debt...")

    debt_data = [
        {
            "title": "Legacy Authentication System",
            "description": "Custom authentication system needs migration to OAuth 2.0 standard",
            "priority": "high",
            "status": "accepted",
            "impact": "Security vulnerabilities, maintenance burden, difficult user management",
            "effort_estimate": "3-4 months",
            "affected_systems": "All customer-facing applications",
            "resolution_strategy": "Migrate to OAuth 2.0 implementation gradually by application",
            "target_resolution_date": datetime.now() + timedelta(days=120),
            "adr_id": adrs[4].id if len(adrs) > 4 else None
        },
        {
            "title": "Monolithic Database Performance",
            "description": "Single database bottleneck limiting application scalability",
            "priority": "critical",
            "status": "in_progress",
            "impact": "Slow query performance, deployment downtime, scaling limitations",
            "effort_estimate": "6-8 months",
            "affected_systems": "ERP, CRM, Inventory System",
            "resolution_strategy": "Implement database-per-service pattern during microservices migration",
            "target_resolution_date": datetime.now() + timedelta(days=180),
            "adr_id": adrs[3].id if len(adrs) > 3 else None
        },
        {
            "title": "Outdated SSL/TLS Certificates Management",
            "description": "Manual certificate management leading to expiration incidents",
            "priority": "high",
            "status": "identified",
            "impact": "Service outages, security warnings, customer trust issues",
            "effort_estimate": "1-2 months",
            "affected_systems": "All public-facing applications",
            "resolution_strategy": "Implement automated certificate management using Let's Encrypt or ACM"
        },
        {
            "title": "Insufficient API Rate Limiting",
            "description": "APIs lack proper rate limiting exposing system to abuse",
            "priority": "medium",
            "status": "identified",
            "impact": "Resource exhaustion risk, potential DoS vulnerability, unpredictable costs",
            "effort_estimate": "2-3 weeks",
            "affected_systems": "Public APIs, Partner Integration APIs",
            "resolution_strategy": "Implement API gateway with rate limiting and throttling policies",
            "target_resolution_date": datetime.now() + timedelta(days=60),
            "adr_id": adrs[2].id if len(adrs) > 2 else None
        },
        {
            "title": "Inconsistent Logging Practices",
            "description": "Applications use different logging formats and destinations",
            "priority": "medium",
            "status": "accepted",
            "impact": "Difficult troubleshooting, poor observability, increased MTTR",
            "effort_estimate": "2-3 months",
            "affected_systems": "All applications",
            "resolution_strategy": "Standardize on structured logging with centralized log aggregation"
        },
        {
            "title": "Missing Database Backups for Non-Production",
            "description": "Development and staging databases lack automated backup procedures",
            "priority": "low",
            "status": "identified",
            "impact": "Data loss risk in non-prod environments, longer environment recovery time",
            "effort_estimate": "1 week",
            "affected_systems": "Development, Staging, QA environments",
            "resolution_strategy": "Implement automated backup solution for all database instances"
        }
    ]

    debt_items = []
    for data in debt_data:
        debt = TechDebt(**data)
        db.add(debt)
        debt_items.append(debt)

    db.commit()
    print(f"✓ Created {len(debt_items)} technical debt items")
    return debt_items

def generate_all_sample_data():
    """Generate all sample data"""
    db = SessionLocal()

    try:
        print("\n" + "="*60)
        print("EA Direct - Sample Data Generator")
        print("="*60 + "\n")

        # Clear existing data
        clear_sample_data(db)

        # Generate data in order
        suppliers = generate_suppliers(db)
        products = generate_products(db, suppliers)
        apps = generate_business_apps(db, products)
        adrs = generate_adrs(db)
        debt = generate_tech_debt(db, adrs)

        print("\n" + "="*60)
        print("✓ Sample data generation completed successfully!")
        print("="*60)
        print(f"\nGenerated:")
        print(f"  - {len(suppliers)} Suppliers")
        print(f"  - {len(products)} Products")
        print(f"  - {len(apps)} Business Applications")
        print(f"  - {len(adrs)} ADRs")
        print(f"  - {len(debt)} Technical Debt Items")
        print("\n")

        return True
    except Exception as e:
        print(f"\n✗ Error generating sample data: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    generate_all_sample_data()
