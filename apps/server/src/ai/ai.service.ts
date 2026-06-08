import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ParsedBill {
  amount: number | null;
  type: 'income' | 'expense' | null;
  category: string | null;
  note: string | null;
  date: string | null;
  confidence: number;
}

export interface CategorySuggestion {
  categoryName: string;
  confidence: number;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
    });
  }

  async parseBill(text: string, today: string): Promise<ParsedBill> {
    const systemPrompt = `你是一个记账助手。用户会用自然语言描述一笔收入或支出。
请从中提取以下信息并以JSON格式返回：
- amount: 金额（数字，如果无法确定则为null）
- type: "income" 或 "expense"（如果无法确定则为null）
- category: 分类名称，从以下选项中选择最合适的一个：餐饮、交通、购物、娱乐、居住、医疗、教育、通讯、日用、工资、兼职、理财、红包、其他收入、其他支出。如果无法确定则为null。
- note: 备注/描述（简短的文字描述）
- date: 日期（YYYY-MM-DD格式）。"今天"=${today}，"昨天"是今天减1天，"前天"减2天，以此类推。如果没提到日期，则为今天。
- confidence: 整体置信度 0-1

仅返回JSON，不要其他文字。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') as string,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      if (error.status === 401 || error.code === 'insufficient_quota') {
        throw new ServiceUnavailableException('AI 服务暂时不可用');
      }
      throw new ServiceUnavailableException('AI 解析失败，请使用手动记账');
    }
  }

  async suggestCategories(
    note: string,
    historyCategories: { note: string; category: string }[],
  ): Promise<CategorySuggestion[]> {
    const historyContext = historyCategories.length > 0
      ? `\n用户历史记账模式：\n${historyCategories.slice(0, 20).map((h) => `"${h.note}" -> ${h.category}`).join('\n')}`
      : '';

    const systemPrompt = `你是一个记账分类推荐助手。根据用户输入的备注，推荐最合适的3个分类。
可选分类：餐饮、交通、购物、娱乐、居住、医疗、教育、通讯、日用、工资、兼职、理财、红包、其他收入、其他支出。${historyContext}

返回JSON数组格式，每个元素包含 categoryName 和 confidence(0-1)。按 confidence 降序排列。仅返回JSON。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') as string,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: note },
        ],
        temperature: 0.1,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) return [];

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
  }

  async generateMonthlyReport(data: {
    year: number;
    month: number;
    totalExpense: number;
    totalIncome: number;
    byCategory: { categoryName: string; amount: number }[];
    billCount: number;
    previousMonth?: { totalExpense: number; totalIncome: number };
  }): Promise<string> {
    const prevComparison = data.previousMonth
      ? `\n上月支出：¥${data.previousMonth.totalExpense.toFixed(2)}，上月收入：¥${data.previousMonth.totalIncome.toFixed(2)}`
      : '';

    const categoryBreakdown = data.byCategory
      .sort((a, b) => b.amount - a.amount)
      .map((c) => `${c.categoryName}: ¥${c.amount.toFixed(2)}`)
      .join('、');

    const prompt = `请根据以下消费数据生成一份简洁的月度消费分析报告（中文，300字以内）：

${data.year}年${data.month}月消费报告
- 总支出：¥${data.totalExpense.toFixed(2)}
- 总收入：¥${data.totalIncome.toFixed(2)}
- 结余：¥${(data.totalIncome - data.totalExpense).toFixed(2)}
- 记账笔数：${data.billCount}
- 分类支出：${categoryBreakdown}${prevComparison}

请包含：1. 消费总结 2. 主要支出分析 3. 与上月对比（如有） 4. 节省建议`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') as string,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content?.trim() || '暂无分析报告';
    } catch {
      throw new ServiceUnavailableException('AI 分析服务暂时不可用');
    }
  }
}
