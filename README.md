# RERA Report Card

A public report card for under-construction housing projects in India. Each project gets a grade based on what its developer has filed with the state real estate regulator (RERA).

Every project has one page. The grade comes from public RERA filings, and every reason behind it cites the filing it came from, so a buyer can check the source.

The first scope is Maharashtra and the National Capital Region (NCR). Other states may follow once those work well.

Status: early build. The grader (`src/grade.ts`, rules in `rules/`) and the Haryana RERA reader (`src/states/hr/`) are in. Run `npm test`.
