// Import the function
import {
  parseTextualTag,
  frequencyPatterns,
  dayOfWeekPatterns,
  create,
} from "@src/agenda/models/projects/tag-dicts";

describe("parseTextualTag", () => {
  it("should parse frequency tags", () => {
    expect(parseTextualTag("daily", frequencyPatterns)).toEqual(
      new Set(["daily"])
    );
    expect(parseTextualTag("week", frequencyPatterns)).toEqual(
      new Set(["weekly"])
    );
    expect(parseTextualTag("weekly", frequencyPatterns)).toEqual(
      new Set(["weekly"])
    );
    expect(parseTextualTag("month", frequencyPatterns)).toEqual(
      new Set(["monthly"])
    );
    expect(parseTextualTag("monthly", frequencyPatterns)).toEqual(
      new Set(["monthly"])
    );
    expect(parseTextualTag("year", frequencyPatterns)).toEqual(
      new Set(["yearly"])
    );
    expect(parseTextualTag("yearly", frequencyPatterns)).toEqual(
      new Set(["yearly"])
    );
  });

  // Add more test cases as needed
});

describe("parseTextualTag", () => {
  it("should parse day of the week tags", () => {
    console.log(
      `parseTextualTag("monday", dayOfWeekPatterns)`,
      parseTextualTag("monday", dayOfWeekPatterns)
    );
    expect(parseTextualTag("monday", dayOfWeekPatterns)).toEqual(
      new Set(["monday"])
    );
    expect(parseTextualTag("mon", dayOfWeekPatterns)).toEqual(
      new Set(["monday"])
    );
    expect(parseTextualTag("tuesday", dayOfWeekPatterns)).toEqual(
      new Set(["tuesday"])
    );
    expect(parseTextualTag("tue", dayOfWeekPatterns)).toEqual(
      new Set(["tuesday"])
    );
    expect(parseTextualTag("wednesday", dayOfWeekPatterns)).toEqual(
      new Set(["wednesday"])
    );
    expect(parseTextualTag("wed", dayOfWeekPatterns)).toEqual(
      new Set(["wednesday"])
    );
    expect(parseTextualTag("thursday", dayOfWeekPatterns)).toEqual(
      new Set(["thursday"])
    );
    expect(parseTextualTag("thu", dayOfWeekPatterns)).toEqual(
      new Set(["thursday"])
    );
    expect(parseTextualTag("friday", dayOfWeekPatterns)).toEqual(
      new Set(["friday"])
    );
    expect(parseTextualTag("fri", dayOfWeekPatterns)).toEqual(
      new Set(["friday"])
    );
    expect(parseTextualTag("saturday", dayOfWeekPatterns)).toEqual(
      new Set(["saturday"])
    );
    expect(parseTextualTag("sat", dayOfWeekPatterns)).toEqual(
      new Set(["saturday"])
    );
    expect(parseTextualTag("sunday", dayOfWeekPatterns)).toEqual(
      new Set(["sunday"])
    );
    expect(parseTextualTag("sun", dayOfWeekPatterns)).toEqual(
      new Set(["sunday"])
    );
  });

  describe("create()", () => {
    expect(
      create(
        ["sun", "fri", "weekly"].map((v, i) => ({
          id: i.toString(),
          title: v,
          parent_id: "0",
        }))
      )
    ).toEqual({
      frequency: new Set(["weekly"]),
      monthName: new Set(),
      dayOfWeek: new Set(["sunday", "friday"]),
      dayNumber: new Set(),
      yearNumber: new Set(),
    });
  });

  // Add more test cases as needed
});
