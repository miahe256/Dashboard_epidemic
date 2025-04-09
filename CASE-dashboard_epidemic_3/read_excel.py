import pandas as pd
import os

# 获取当前脚本所在目录的绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))

# 读取Excel文件（使用绝对路径）
file_path = os.path.join(current_dir, '香港各区疫情数据_20250323.xlsx')

def read_excel(file_path):
    # 使用pandas读取Excel文件
    print(f"尝试读取文件: {file_path}")
    print(f"文件是否存在: {os.path.exists(file_path)}")
    
    # 列出目录中的文件
    print("目录中的文件:")
    for file in os.listdir(current_dir):
        print(f"- {file}")
    
    # 使用pandas读取Excel文件
    try:
        df = pd.read_excel(file_path)
        
        # 打印字段名称
        print('字段名称:')
        print(df.columns.tolist())
        
        # 打印前20行数据
        print('\n前20行数据:')
        print(df.head(20))
        return df
    except Exception as e:
        print(f"读取Excel出错: {e}")
        return None

if __name__ == "__main__":
    read_excel(file_path)