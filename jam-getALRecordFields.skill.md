
---
name: jam-getalrecordfields
description: Extracts all field names and types from an AL record variable. Use this skill to generate documentation, code, or validation logic for AL records by providing the variable name (not just the table name). Especially useful for AL development, code generation, and technical documentation.
argument-hint: '[record variable name]'
user-invokable: true
---

# jam-getALRecordFields Skill

## What this skill does
Extracts all field names and types from an AL record variable. Use this skill to:
- Generate code or documentation for AL records
- Validate or inspect record structure
- Automate repetitive AL development tasks

## When to use
- When you need a list of all fields and types for a specific AL record variable (e.g., for code generation, documentation, or validation)
- When building tools or scripts that require AL record metadata

## How to use
1. Identify the AL record variable you want to inspect (e.g., `CustomerRec` from `CustomerRec: Record Customer`).
2. Invoke this skill with the variable name as the argument.
3. The skill will return a list of all field names and their types for that record.

## Example

**Prompt:**
```
Use jam-getALRecordFields to list all fields and types for the AL record variable 'CustomerRec'.
```

**Input:**
```json
{
  "record": "CustomerRec"
}
```

**Output:**
```json
[
  { "fieldName": "Name", "type": "Text" },
  { "fieldName": "Address", "type": "Text" },
  { "fieldName": "Balance", "type": "Decimal" }
]
```

---

**Prompt:**
```
Automate fields asign: Use jam-getALRecordFields to Get all fields from a "From Record" and "To Recode"
```

**Input:**
From Record and To Record variables:
Then use the output to generate code that assigns values from the "From Record" to the "To Record" for all matching fields.

**Output:**
And return code like this:
```
FromRecord.FieldName = ToRecord.FieldName;
FormRecord.AnotherField = ToRecord.AnotherField;

```

---

> This skill follows the [Agent Skills standard](https://agentskills.io/) and is compatible with GitHub Copilot and other skills-enabled agents. For more information, see the [VS Code Agent Skills documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills).
