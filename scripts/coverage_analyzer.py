#!/usr/bin/env python3
"""
Coverage Analyzer Script
Analyzes coverage reports by file type and enforces hierarchical thresholds.
"""

import re
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple
import subprocess

# Configuration
OVERALL_THRESHOLD = 85  # Warning if below
CRITICAL_THRESHOLD = 93  # Block if below
IMPORTANT_THRESHOLD = 85  # Warning if below

# File classification patterns
CRITICAL_PATTERNS = [
    # Frontend critical patterns
    r'.*/model/.*\.ts$',           # Business logic models
    r'.*/lib/.*helpers?\.ts$',     # Helper functions
    r'.*/lib/.*validation\.ts$',  # Validation logic
    r'.*/lib/.*time.*\.ts$',      # Time helpers
    
    # Backend critical patterns
    r'.*/entity\.go$',             # Domain entities
    r'.*/valueobject\.go$',        # Value objects
    r'.*/service\.go$',           # Domain services
    r'.*/command/.*\.go$',        # Command handlers
    r'.*/query/.*\.go$',          # Query handlers
    r'.*/epoch\.go$',             # Time helpers
    r'.*/response\.go$',           # Response helpers
    r'.*/validators?\.go$',       # Validation helpers
]

IMPORTANT_PATTERNS = [
    # Frontend important patterns
    r'.*/handler\.go$',           # HTTP handlers
    r'.*/ui/.*\.svelte$',          # UI components
    r'.*/repository\.go$',        # Repository implementations
    r'.*/pages/.*Page\.svelte$',   # Page components
]

EXCLUDED_PATTERNS = [
    # Type definitions
    r'.*/types/.*\.ts$',
    r'.*/\.d\.ts$',
    r'.*/index\.ts$',             # Usually barrel files
    
    # Configuration
    r'.*/routes/.*\.ts$',
    r'.*/config/.*\.ts$',
    r'.*\.config\..*$',
    
    # Auto-generated
    r'.*/generated/.*',
    r'.*/.*_test\.go$',          # Test files themselves
    r'.*/.*\.spec\.ts$',         # Test files themselves
    
    # Error pages
    r'.*/error/.*',
    r'.*/404.*',
    r'.*/500.*',
    
    # Boilerplate
    r'.*/boilerplate/.*',
]

def classify_file(file_path: str) -> str:
    """Classify file based on path patterns"""
    file_path = file_path.replace('\\', '/')  # Normalize path separators
    
    # Check exclusions first
    for pattern in EXCLUDED_PATTERNS:
        if re.match(pattern, file_path):
            return 'excluded'
    
    # Check critical patterns
    for pattern in CRITICAL_PATTERNS:
        if re.match(pattern, file_path):
            return 'critical'
    
    # Check important patterns
    for pattern in IMPORTANT_PATTERNS:
        if re.match(pattern, file_path):
            return 'important'
    
    return 'other'

def parse_go_coverage(coverage_file: str) -> Dict[str, float]:
    """Parse Go coverage report"""
    coverage_data = {}
    
    with open(coverage_file, 'r') as f:
        for line in f:
            if line.startswith('mode:'):
                continue
            
            parts = line.split()
            if len(parts) >= 3:
                file_path = parts[0]
                coverage_str = parts[2]
                
                # Extract percentage
                coverage_match = re.search(r'(\d+\.?\d*)%', coverage_str)
                if coverage_match:
                    coverage = float(coverage_match.group(1))
                    coverage_data[file_path] = coverage
    
    return coverage_data

def parse_frontend_coverage(coverage_file: str) -> Dict[str, float]:
    """Parse frontend coverage report (JSON format from Vitest)"""
    try:
        with open(coverage_file, 'r') as f:
            data = json.load(f)
        
        coverage_data = {}
        for file_path, file_data in data.items():
            if 'coverage' in file_data:
                coverage_data[file_path] = file_data['coverage']
        
        return coverage_data
    except:
        # Fallback: try parsing from text format
        coverage_data = {}
        with open(coverage_file, 'r') as f:
            for line in f:
                if '%' in line:
                    parts = line.split()
                    if len(parts) >= 2:
                        file_path = parts[0]
                        coverage_str = parts[1]
                        coverage_match = re.search(r'(\d+\.?\d*)%', coverage_str)
                        if coverage_match:
                            coverage_data[file_path] = float(coverage_match.group(1))
        return coverage_data

def analyze_coverage_by_category(coverage_data: Dict[str, float]) -> Dict[str, Dict]:
    """Analyze coverage by file category"""
    categories = {
        'critical': {'files': [], 'total_coverage': 0, 'count': 0},
        'important': {'files': [], 'total_coverage': 0, 'count': 0},
        'excluded': {'files': [], 'total_coverage': 0, 'count': 0},
        'other': {'files': [], 'total_coverage': 0, 'count': 0}
    }
    
    for file_path, coverage in coverage_data.items():
        category = classify_file(file_path)
        categories[category]['files'].append((file_path, coverage))
        categories[category]['total_coverage'] += coverage
        categories[category]['count'] += 1
    
    # Calculate average coverage per category
    for category in categories.values():
        if category['count'] > 0:
            category['average_coverage'] = category['total_coverage'] / category['count']
        else:
            category['average_coverage'] = 0
    
    return categories

def generate_report(categories: Dict[str, Dict], overall_coverage: float) -> Dict:
    """Generate coverage analysis report"""
    report = {
        'overall_coverage': overall_coverage,
        'overall_threshold': OVERALL_THRESHOLD,
        'critical_threshold': CRITICAL_THRESHOLD,
        'important_threshold': IMPORTANT_THRESHOLD,
        'categories': {},
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    # Analyze each category
    for category_name, category_data in categories.items():
        avg_coverage = category_data['average_coverage']
        
        report['categories'][category_name] = {
            'average_coverage': avg_coverage,
            'file_count': category_data['count'],
            'files': category_data['files']
        }
        
        # Check critical threshold
        if category_name == 'critical':
            if avg_coverage < CRITICAL_THRESHOLD:
                report['status'] = 'FAIL'
                report['violations'].append(
                    f"CRITICAL coverage {avg_coverage:.1f}% below {CRITICAL_THRESHOLD}% threshold"
                )
            else:
                report['categories'][category_name]['status'] = 'PASS'
        
        # Check important threshold
        elif category_name == 'important':
            if avg_coverage < IMPORTANT_THRESHOLD:
                report['warnings'].append(
                    f"IMPORTANT coverage {avg_coverage:.1f}% below {IMPORTANT_THRESHOLD}% threshold"
                )
            report['categories'][category_name]['status'] = 'WARN' if avg_coverage < IMPORTANT_THRESHOLD else 'PASS'
        
        # Excluded files
        elif category_name == 'excluded':
            report['categories'][category_name]['status'] = 'EXCLUDED'
        
        # Other files
        else:
            report['categories'][category_name]['status'] = 'OTHER'
    
    # Check overall baseline
    if overall_coverage < OVERALL_THRESHOLD:
        report['warnings'].append(
            f"OVERALL coverage {overall_coverage:.1f}% below {OVERALL_THRESHOLD}% baseline"
        )
    
    return report

def print_report(report: Dict):
    """Print human-readable report"""
    print("=" * 60)
    print("COVERAGE ANALYSIS REPORT")
    print("=" * 60)
    print(f"\nOverall Coverage: {report['overall_coverage']:.1f}% (threshold: {report['overall_threshold']}%)")
    print(f"Critical Threshold: {report['critical_threshold']}%")
    print(f"Important Threshold: {report['important_threshold']}%")
    
    print("\n" + "-" * 60)
    print("COVERAGE BY CATEGORY")
    print("-" * 60)
    
    for category_name, category_data in report['categories'].items():
        status = category_data['status']
        avg_coverage = category_data['average_coverage']
        file_count = category_data['file_count']
        
        status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️" if status == "WARN" else "⏭️"
        
        print(f"\n{status_symbol} {category_name.upper()}: {avg_coverage:.1f}% ({file_count} files)")
        
        if category_data['files']:
            print("  Files:")
            for file_path, coverage in category_data['files'][:5]:  # Show first 5
                print(f"    {file_path}: {coverage:.1f}%")
            if len(category_data['files']) > 5:
                print(f"    ... and {len(category_data['files']) - 5} more files")
    
    print("\n" + "-" * 60)
    print("VIOLATIONS")
    print("-" * 60)
    
    if report['violations']:
        for violation in report['violations']:
            print(f"❌ {violation}")
    else:
        print("✅ No violations")
    
    print("\n" + "-" * 60)
    print("WARNINGS")
    print("-" * 60)
    
    if report['warnings']:
        for warning in report['warnings']:
            print(f"⚠️  {warning}")
    else:
        print("✅ No warnings")
    
    print("\n" + "=" * 60)
    print(f"FINAL STATUS: {report['status']}")
    print("=" * 60)

def main():
    """Main execution"""
    # Detect coverage file type
    if len(sys.argv) > 1:
        coverage_file = sys.argv[1]
    else:
        # Try to find coverage file
        coverage_file = 'coverage.out'
        if not Path(coverage_file).exists():
            coverage_file = 'coverage/coverage.json'
            if not Path(coverage_file).exists():
                print("Error: No coverage file found")
                sys.exit(1)
    
    print(f"Analyzing coverage from: {coverage_file}")
    
    # Parse coverage data
    if coverage_file.endswith('.out'):
        coverage_data = parse_go_coverage(coverage_file)
    else:
        coverage_data = parse_frontend_coverage(coverage_file)
    
    if not coverage_data:
        print("Error: Could not parse coverage data")
        sys.exit(1)
    
    # Calculate overall coverage
    overall_coverage = sum(coverage_data.values()) / len(coverage_data)
    
    # Analyze by category
    categories = analyze_coverage_by_category(coverage_data)
    
    # Generate report
    report = generate_report(categories, overall_coverage)
    
    # Print report
    print_report(report)
    
    # Save report to file
    with open('coverage_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    # Exit with appropriate code
    if report['status'] == 'FAIL':
        print("\n❌ Coverage check FAILED")
        sys.exit(1)
    else:
        print("\n✅ Coverage check PASSED")
        sys.exit(0)

if __name__ == '__main__':
    main()