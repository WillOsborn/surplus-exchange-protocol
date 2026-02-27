# Check Documentation Health Skill

Audit documentation for staleness, inconsistency, and completeness.

## When to Use

- After significant codebase changes
- When starting a new session
- Periodically for maintenance
- Before releases

## Checks Performed

### 1. README.md Accuracy

**Agents match .claude/agents/**
```bash
# Count agents in directory
ls .claude/agents/*.md | wc -l

# Verify each is listed in README.md
for f in .claude/agents/*.md; do
  name=$(basename "$f" .md)
  grep -q "$name" README.md || echo "Missing: $name"
done
```

**Commands match .claude/commands/**
```bash
# Count commands in directory
ls .claude/commands/*.md | wc -l

# Verify each is listed in README.md
for f in .claude/commands/*.md; do
  name=$(basename "$f" .md)
  grep -q "/$name" README.md || echo "Missing: /$name"
done
```

### 2. CLAUDE.md Structure Accuracy

**Project structure matches reality**
- Check each directory exists
- Verify file counts are approximately correct
- Check for new directories not in tree

### 3. docs/INDEX.md Completeness

**All docs are indexed**
```bash
# Count actual docs
find docs -name "*.md" -not -name "INDEX.md" | wc -l

# Compare with INDEX.md entries
grep -c "\.md" docs/INDEX.md
```

### 4. Design Document Status Headers

**All design docs have status headers**
```bash
for f in docs/design/*.md; do
  if ! grep -q "^\*\*Status\*\*:" "$f"; then
    echo "Missing status: $f"
  fi
done
```

### 5. open-questions.md Currency

**Check for resolved items still listed as open**
- Items with "Complete" specs should be marked resolved
- Items with implementations in src/ should be marked resolved

### 6. Terminology Consistency

**Check for deprecated terms**
```bash
# Should find nothing (rename is complete)
grep -r "agent_matching" --include="*.ts" --include="*.json" src/
```

### 7. Work Package Status Consistency

**Primary source**: docs/design/work-packages.md

Check that WP references match across:
- docs/INDEX.md WP references
- STATUS.md "In Progress" items
- CLAUDE.md remaining items

```bash
# Check work-packages.md exists and has recent date
head -5 docs/design/work-packages.md
```

### 8. Open Questions vs Decisions Alignment

**Check lifecycle status**:
- Items marked ✅ RESOLVED in open-questions.md should have `Status: Accepted` in decisions.md
- Items with `Status: Proposed` in decisions.md should be 📊 ANALYSED (not RESOLVED) in open-questions.md

```bash
# Check for lifecycle section
grep -A2 "## Question Lifecycle" docs/design/open-questions.md

# Check ANALYSED section exists
grep "ANALYSED" docs/design/open-questions.md
```

### 9. Phase 1 Readiness Percentage Sync

**Primary source**: STATUS.md

Check percentage matches in:
- README.md
- CLAUDE.md
- CHANGELOG.md [Unreleased] section

```bash
# Extract percentages
grep -E "[0-9]+% Complete" STATUS.md README.md CLAUDE.md CHANGELOG.md
```

## Output Format

```markdown
## Documentation Health Report

### Summary
- Total checks: 9
- Passed: 7
- Failed: 2

### Details

#### README.md ✓
- Agents: 10 listed, 10 exist
- Commands: 5 listed, 5 exist

#### CLAUDE.md ✓
- Structure matches reality
- File counts accurate

#### docs/INDEX.md ✗
- Listed: 35 files
- Actual: 37 files
- Missing: capability-translation.md, federation-exploration.md

#### Design Doc Headers ✗
- 14/16 have status headers
- Missing: chain-discovery.md, scenarios.md

#### open-questions.md ✓
- All resolved items marked

#### Terminology ✓
- No deprecated agent_matching found

#### Work Package Status ✓
- work-packages.md is authoritative source
- References consistent across docs

#### Open Questions Lifecycle ✓
- Lifecycle documented
- ANALYSED section present for pending decisions

#### Phase 1 Readiness % ✓
- STATUS.md: 95%
- README.md: 95%
- CLAUDE.md: 95%
- CHANGELOG.md: 95%

### Recommended Actions
1. Add 2 missing files to docs/INDEX.md
2. Add status headers to 2 design docs
```

## Related

- `project-maintainer` agent - Uses this skill
- `/session-start` - Can run health check at session start
- `STATUS.md` - Tracks known issues
